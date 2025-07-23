import { ResumeBullet } from '../services/resumeGenerator';

export class OutputFormatter {
    formatBullets(bullets: ResumeBullet[]): string {
        let output = '';
        
        // Sort by confidence
        bullets.sort((a, b) => b.confidence - a.confidence);

        bullets.forEach((bullet, index) => {
            output += `${index + 1}. ${bullet.content}\n`;
            if (bullet.tags.length > 0) {
                output += `   Tags: ${bullet.tags.join(', ')}\n`;
            }
            output += `   Confidence: ${Math.round(bullet.confidence * 100)}%\n\n`;
        });

        return output;
    }

    formatAsMarkdown(bullets: ResumeBullet[]): string {
        let output = '# Resume Points\n\n';
        
        bullets.forEach(bullet => {
            output += `- ${bullet.content}\n`;
        });

        return output;
    }
}