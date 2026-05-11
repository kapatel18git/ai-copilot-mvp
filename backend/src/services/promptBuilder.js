const buildCompletePrompt = (code, language = 'javascript', context = '') => {
  return `You are an expert ${language} programmer. Complete the following code snippet:

\`\`\`${language}
${code}
\`\`\`

Context: ${context || 'No additional context'}

Provide only the completion without markdown formatting or code blocks.`;
};

const buildExplainPrompt = (code, language = 'javascript') => {
  return `You are an expert programmer. Explain what the following ${language} code does:

\`\`\`${language}
${code}
\`\`\`

Provide a clear, concise explanation suitable for developers.`;
};

const buildFixPrompt = (code, language = 'javascript', description = '') => {
  return `You are an expert ${language} programmer. Review the following code and identify any bugs or issues:

\`\`\`${language}
${code}
\`\`\`

${description ? `Issue: ${description}` : ''}

Provide the fixed code with a brief explanation of what was wrong.`;
};

const buildTestPrompt = (code, language = 'javascript', framework = 'jest') => {
  return `You are an expert ${language} programmer. Generate unit tests for the following code using ${framework}:

\`\`\`${language}
${code}
\`\`\`

Provide only the test code without explanations. Include tests for normal cases, edge cases, and error handling.`;
};

const buildDocsPrompt = (code, language = 'javascript', style = 'jsdoc') => {
  return `You are an expert technical writer. Generate ${style} documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Function/class description
- Parameters with types
- Return value description
- Examples if applicable

Provide only the documentation without additional text.`;
};

module.exports = {
  buildCompletePrompt,
  buildExplainPrompt,
  buildFixPrompt,
  buildTestPrompt,
  buildDocsPrompt,
};
