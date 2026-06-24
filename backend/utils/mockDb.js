const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/db.json');

// Ensure data directory and db.json exist
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({
    users: [],
    candidates: [],
    jobs: [],
    applications: []
  }, null, 2));
}

// Read database
const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], candidates: [], jobs: [], applications: [] };
  }
};

// Write database
const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Generate random 24-character hex ID (similar to MongoDB ObjectId)
const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Helper to check if a value matches query criteria
const matchField = (itemVal, queryVal) => {
  if (queryVal instanceof RegExp) {
    return queryVal.test(String(itemVal));
  }
  if (typeof queryVal === 'object' && queryVal !== null) {
    if (queryVal.$in && Array.isArray(queryVal.$in)) {
      // e.g., { skills: { $in: [/react/i] } }
      // check if any element in itemVal matches any regex/value in queryVal.$in
      const itemArr = Array.isArray(itemVal) ? itemVal : [itemVal];
      return itemArr.some(val => 
        queryVal.$in.some(q => q instanceof RegExp ? q.test(String(val)) : String(val).toLowerCase() === String(q).toLowerCase())
      );
    }
  }
  return String(itemVal) === String(queryVal);
};

// Helper to filter documents based on a mongoose-like query object
const filterItems = (items, query = {}) => {
  return items.filter(item => {
    // If empty query, match everything
    if (Object.keys(query).length === 0) return true;

    // Handle $or query
    if (query.$or && Array.isArray(query.$or)) {
      return query.$or.some(subQuery => filterItems([item], subQuery).length > 0);
    }

    // Handle normal key-value match
    for (const key in query) {
      if (key === '$or' || key === 'myJobs') continue;
      
      const queryVal = query[key];
      const itemVal = item[key];

      // Handle nested match (e.g. { 'user': '...' })
      if (itemVal === undefined) {
        // key might refer to job.recruiter, but in application it's just job
        return false;
      }

      if (!matchField(itemVal, queryVal)) {
        return false;
      }
    }
    return true;
  });
};

// Populate helper
const populateDoc = (doc, field, collectionName, dbData) => {
  if (!doc || !doc[field]) return doc;
  
  const targetId = doc[field].toString();
  const targetItem = dbData[collectionName].find(item => item._id === targetId);
  
  if (targetItem) {
    // Deep clone to avoid mutating reference in DB cache
    doc[field] = JSON.parse(JSON.stringify(targetItem));
  }
  return doc;
};

// Query class helper to support chaining like .populate(), .sort(), etc.
class MockQuery {
  constructor(results, dbData, collectionName, isSingle = false) {
    this.results = JSON.parse(JSON.stringify(results)); // clone
    this.dbData = dbData;
    this.collectionName = collectionName;
    this.isSingle = isSingle;
  }

  populate(options) {
    let fields = [];
    if (typeof options === 'string') {
      fields = [options];
    } else if (typeof options === 'object' && options !== null) {
      // nested populate, e.g. { path: 'candidate', populate: { path: 'user' } }
      const path = options.path;
      this.results.forEach(doc => {
        if (path === 'candidate') {
          populateDoc(doc, 'candidate', 'candidates', this.dbData);
          if (options.populate && doc.candidate) {
            populateDoc(doc.candidate, options.populate.path, 'users', this.dbData);
          }
        } else if (path === 'job') {
          populateDoc(doc, 'job', 'jobs', this.dbData);
        }
      });
      return this;
    }

    this.results.forEach(doc => {
      fields.forEach(field => {
        if (field === 'user') populateDoc(doc, 'user', 'users', this.dbData);
        if (field === 'job') populateDoc(doc, 'job', 'jobs', this.dbData);
        if (field === 'candidate') populateDoc(doc, 'candidate', 'candidates', this.dbData);
      });
    });
    return this;
  }

  sort(sortOptions = {}) {
    const key = Object.keys(sortOptions)[0];
    const order = sortOptions[key]; // 1 or -1
    
    this.results.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (key === 'createdAt' || key === 'appliedAt') {
        valA = new Date(valA || 0);
        valB = new Date(valB || 0);
      }
      
      if (valA < valB) return order === -1 ? 1 : -1;
      if (valA > valB) return order === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }

  select(selectStr) {
    // mock select (e.g. select('+password'))
    return this;
  }

  // To make it thenable (so we can await the query)
  then(onResolve, onReject) {
    let resolvedValue = this.isSingle ? (this.results[0] || null) : this.results;
    
    // Attach matchPassword if it's a User doc
    if (this.isSingle && resolvedValue && this.collectionName === 'users') {
      resolvedValue.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password || resolvedValue.password);
      };
    }
    
    return Promise.resolve(resolvedValue).then(onResolve, onReject);
  }
}

// Function to construct a mock Mongoose Model
const createMockModel = (collectionName) => {
  return {
    find: function (query = {}) {
      const dbData = readDb();
      const items = filterItems(dbData[collectionName], query);
      return new MockQuery(items, dbData, collectionName, false);
    },

    findOne: function (query = {}) {
      const dbData = readDb();
      const items = filterItems(dbData[collectionName], query);
      const doc = items[0] || null;
      return new MockQuery(doc ? [doc] : [], dbData, collectionName, true);
    },

    findById: function (id) {
      if (!id) return new MockQuery([], readDb(), collectionName, true);
      const dbData = readDb();
      const doc = dbData[collectionName].find(item => item._id === id.toString());
      return new MockQuery(doc ? [doc] : [], dbData, collectionName, true);
    },

    create: async function (data) {
      const dbData = readDb();
      
      const newDoc = {
        _id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // If user collection, hash password
      if (collectionName === 'users' && data.password) {
        const salt = await bcrypt.genSalt(10);
        newDoc.password = await bcrypt.hash(data.password, salt);
      }

      dbData[collectionName].push(newDoc);
      writeDb(dbData);

      // Clone and return
      const returnedDoc = JSON.parse(JSON.stringify(newDoc));
      if (collectionName === 'users') {
        returnedDoc.matchPassword = async function (enteredPassword) {
          return await bcrypt.compare(enteredPassword, returnedDoc.password);
        };
      }
      return returnedDoc;
    },

    findByIdAndUpdate: async function (id, update, options = {}) {
      const dbData = readDb();
      const index = dbData[collectionName].findIndex(item => item._id === id.toString());
      if (index === -1) return null;

      const current = dbData[collectionName][index];
      
      // Update values
      dbData[collectionName][index] = {
        ...current,
        ...update,
        updatedAt: new Date()
      };

      writeDb(dbData);
      return dbData[collectionName][index];
    },

    findByIdAndDelete: async function (id) {
      const dbData = readDb();
      const index = dbData[collectionName].findIndex(item => item._id === id.toString());
      if (index === -1) return null;

      const deleted = dbData[collectionName].splice(index, 1)[0];
      writeDb(dbData);
      return deleted;
    },

    countDocuments: async function (query = {}) {
      const dbData = readDb();
      const items = filterItems(dbData[collectionName], query);
      return items.length;
    },

    deleteMany: async function (query = {}) {
      const dbData = readDb();
      const initialLength = dbData[collectionName].length;
      
      dbData[collectionName] = dbData[collectionName].filter(item => {
        // Keep files that DO NOT match the query
        return !filterItems([item], query).length;
      });

      const deletedCount = initialLength - dbData[collectionName].length;
      writeDb(dbData);
      return { deletedCount };
    },

    // index support dummy
    index: function () {}
  };
};

module.exports = {
  createMockModel
};
