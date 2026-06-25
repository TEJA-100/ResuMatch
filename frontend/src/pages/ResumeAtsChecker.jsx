import React, { useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import API from '../services/api';

const ResumeAtsChecker = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Unsupported file type. Please upload a PDF or DOCX file.');
      return;
    }
    if (selectedFile.size > 5000000) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
    setReport(null); // Reset report on new upload
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await API.post('/candidates/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreRangeLabel = (score) => {
    if (score >= 75) return { text: 'Excellent ATS Match', class: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 50) return { text: 'Needs Improvement', class: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { text: 'Poor ATS Compatibility', class: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const content = `=====================================================
ResuMatch ATS Analysis Report
=====================================================
Filename: ${report.filename || 'resume'}
Overall ATS Score: ${report.scores?.overall}/100

-----------------------------------------------------
Score Breakdown:
- Skills Match: ${report.scores?.skills}/100
- Keyword Optimization: ${report.scores?.keyword}/100
- Experience Quality: ${report.scores?.experience}/100
- Education & Certifications: ${report.scores?.education}/100
- Formatting & Structure: ${report.scores?.formatting}/100
- Grammar & Vocabulary: ${report.scores?.grammar}/100

-----------------------------------------------------
Strengths:
${report.strengths?.map(s => `- ${s}`).join('\n')}

-----------------------------------------------------
Areas for Improvement:
${report.improvements?.map(i => `- ${i}`).join('\n')}

-----------------------------------------------------
Keyword Analysis:
- Found: ${report.keywords?.found?.join(', ') || 'None'}
- Missing: ${report.keywords?.missing?.join(', ') || 'None'}
- Recommended: ${report.keywords?.recommended?.join(', ') || 'None'}

-----------------------------------------------------
Grammar & Vocabulary Suggestions:
${report.grammar?.mistakes?.map(m => `- Replace "${m.error}" with "${m.suggestion}"`).join('\n') || 'None'}

-----------------------------------------------------
Personalized Action Items:
- Summary: ${report.suggestions?.summary}
- Skills Section: ${report.suggestions?.skills}
- Experience: ${report.suggestions?.experience}
- Projects: ${report.suggestions?.projects}
- Formatting: ${report.suggestions?.formatting}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResuMatch_ATS_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const gaugeData = report ? [{ name: 'Score', value: report.scores?.overall, fill: getScoreColor(report.scores?.overall) }] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume ATS Score Checker</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume below to analyze compatibility, keywords, spelling, and structure against common ATS filters.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded">
          {error}
        </div>
      )}

      {/* Upload Widget */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging ? 'border-blue-500 bg-blue-50/30' : 'border-slate-300 hover:border-blue-500'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">
              Drag and drop your resume file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF and DOCX formats up to 5MB
            </p>
            <label className="mt-4 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded cursor-pointer border border-blue-200 transition-colors">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700">
            <div>
              <span className="font-semibold block">Selected File:</span>
              <span className="break-all">{file.name}</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer ${
                analyzing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {analyzing ? 'Analyzing File...' : 'Scan & Analyze'}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {report && (
        <div className="space-y-8">
          {/* Top Row: Gauge & Component scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Speedometer Gauge */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Overall ATS Score</h2>
              <div className="w-full h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="80%"
                    outerRadius="100%"
                    barSize={12}
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background
                      clockWise
                      dataKey="value"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pt-8">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {report.scores?.overall}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreRangeLabel(report.scores?.overall).class}`}>
                {getScoreRangeLabel(report.scores?.overall).text}
              </span>
              <button
                onClick={handleDownloadReport}
                className="mt-6 w-full py-2 border border-blue-600 hover:bg-blue-50 text-blue-600 font-semibold rounded text-xs transition-colors cursor-pointer text-center"
              >
                Download Full Report
              </button>
            </div>

            {/* Score Breakdown Bars */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:col-span-2 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Metric Score Breakdown</h2>
              
              <div className="space-y-3">
                {[
                  { name: 'Skills Match', value: report.scores?.skills },
                  { name: 'Keyword Optimization', value: report.scores?.keyword },
                  { name: 'Experience Quality', value: report.scores?.experience },
                  { name: 'Education & Certifications', value: report.scores?.education },
                  { name: 'Formatting & Structure', value: report.scores?.formatting },
                  { name: 'Grammar & Vocabulary', value: report.scores?.grammar }
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.value}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: getScoreColor(item.value)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {report.indicators?.map((indicator, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{indicator.name}</span>
                  <div className="flex items-baseline mt-1 space-x-1.5">
                    <span className="text-xl font-bold text-slate-900">{indicator.value}%</span>
                    <span className="text-[9px] font-semibold text-slate-400">({indicator.status})</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-100 pt-2">
                  {indicator.tip}
                </p>
              </div>
            ))}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {report.strengths?.map((str, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-5050 bg-rose-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {report.improvements?.map((imp, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-rose-500 font-bold">⚠</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keyword Analysis */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Industry Keyword Density Report
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-emerald-700 block">Keywords Found ({report.keywords?.found?.length})</span>
                <div className="flex flex-wrap gap-1">
                  {report.keywords?.found?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {kw}
                    </span>
                  )) || <span className="text-slate-400 italic">None detected</span>}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-rose-700 block">Missing Critical Keywords ({report.keywords?.missing?.length})</span>
                <div className="flex flex-wrap gap-1">
                  {report.keywords?.missing?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                      {kw}
                    </span>
                  )) || <span className="text-slate-400 italic">None missing</span>}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-blue-700 block">Recommended Action Terms ({report.keywords?.recommended?.length})</span>
                <div className="flex flex-wrap gap-1">
                  {report.keywords?.recommended?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {kw}
                    </span>
                  )) || <span className="text-slate-400 italic">None recommended</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Grammar & Vocabulary */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Action Verb & Grammar Check
            </h3>
            
            <div className="text-xs space-y-3">
              <p className="text-slate-500">
                Swapping weak passive vocabulary with strong industry-friendly action verbs boosts recruiter readability:
              </p>
              
              <div className="divide-y divide-slate-100">
                {report.grammar?.mistakes?.map((m, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Detected weak phrase:</span>{' '}
                      <span className="font-bold text-slate-700 line-through bg-rose-50 px-1.5 py-0.5 rounded">
                        "{m.error}"
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Stronger replacement:</span>{' '}
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        "{m.suggestion}"
                      </span>
                    </div>
                  </div>
                )) || <p className="text-slate-400 italic">No grammar recommendations needed.</p>}
              </div>
            </div>
          </div>

          {/* AI Personalized Tips */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Actionable AI Optimization Tips
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Resume Summary Section</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {report.suggestions?.summary}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Technical Skills Layout</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {report.suggestions?.skills}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Experience bullet points</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {report.suggestions?.experience}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Personal Projects</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {report.suggestions?.projects}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">ATS Optimization & Formatting</h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {report.suggestions?.formatting}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAtsChecker;
