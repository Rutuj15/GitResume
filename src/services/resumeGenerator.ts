import { GoogleGenerativeAI } from '@google/generative-ai';
import { CodeSnippet } from './gitAnalyzer';

export interface ResumeBullet {
    content: string;
    confidence: number;
    tags: string[];
}

export class ResumeGenerator {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash'
        });
    }

    async generateBullets(
        snippets: CodeSnippet[],
        style: string,
        maxBullets: number
    ): Promise<ResumeBullet[]> {
        const systemPrompt = this.buildSystemPrompt(style);
        const userPrompt = this.buildUserPrompt(snippets);
        
        // Combine system and user prompts for Gemini
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        try {
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            });

            const response = await result.response;
            const content = response.text();
            
            if (!content) throw new Error('No response from AI');

            // More aggressive cleaning for Gemini responses
            let cleanContent = content.trim();
            
            // Remove markdown code blocks
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            
            // Find JSON object in the response
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanContent = jsonMatch[0];
            } else {
                // If no JSON found, create a fallback response
                console.warn('No JSON found in response:', cleanContent);
                return [{
                    content: "Unable to parse AI response - please check your code contributions",
                    confidence: 0.1,
                    tags: ["error"]
                }];
            }

            const parsedResult = JSON.parse(cleanContent);
            return parsedResult.bullets || [];

        } catch (error: any) {
            throw new Error(`AI generation failed: ${error.message}`);
        }
    }

    private buildSystemPrompt(style: string): string {
        const basePrompt = `You are an expert technical resume writer. Analyze code contributions and generate impactful resume bullet points.

CRITICAL: You must respond with ONLY valid JSON. Do not include any explanation, comments, or markdown formatting.

Requirements:
- Start with strong action verbs (Developed, Implemented, Optimized, etc.)
- Include specific technologies and technical details
- Quantify impact when possible
- Focus on business value and outcomes
- Be concise but specific

Response format (JSON only):
{
  "bullets": [
    {
      "content": "Developed REST API using Node.js and Express, reducing response time by 40%",
      "confidence": 0.9,
      "tags": ["nodejs", "api", "performance"]
    }
  ]
}`;

        const styleGuides: { [key: string]: string } = {
            professional: '\n\nUse formal, achievement-focused language.',
            technical: '\n\nEmphasize technical implementation details and technologies.',
            startup: '\n\nHighlight innovation, versatility, and rapid development.',
            academic: '\n\nFocus on algorithms, research aspects, and theoretical contributions.'
        };

        return basePrompt + (styleGuides[style] || styleGuides.professional) + '\n\nRemember: Respond with ONLY the JSON object, no other text.';
    }

    private buildUserPrompt(snippets: CodeSnippet[]): string {
        let prompt = 'Based on these code contributions, generate resume bullet points:\n\n';

        snippets.forEach((snippet, index) => {
            prompt += `### Contribution ${index + 1}\n`;
            prompt += `File: ${snippet.filePath}\n`;
            prompt += `Language: ${snippet.language}\n`;
            prompt += `Commit: ${snippet.commitMessage}\n`;
            prompt += `Changes: +${snippet.additions} -${snippet.deletions}\n`;
            prompt += `Sample Code:\n\`\`\`${snippet.language}\n${snippet.content}\n\`\`\`\n\n`;
        });

        prompt += `\nGenerate up to ${snippets.length} impactful resume bullets based on these contributions.`;
        return prompt;
    }
}