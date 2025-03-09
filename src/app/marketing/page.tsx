'use client';

import { useState } from 'react';
import { MarketingContent } from '@/lib/types';

const productValueOptions = [
  "High efficiency | 高效率 | 高效率 | 高効率 | 고효율",
  "innovation | 创新 | 創新 | イノベーション | 혁신",
  "environmentally friendly | 环境友好 | 環境友好 | 環境に優しい | 환경 친화적",
  "user friendly | 用户友好 | 用戶友好 | ユーザーフレンドリー | 사용자 친화적",
  "safe and reliable | 安全可靠 | 安全可靠 | 安全で信頼性の高い | 안전하고 신뢰할 수 있는",
  "cost-effective | 性价比高 | 性價比高 | コストパフォーマンスが高い | 비용 효율적",
  "beautiful | 美观大方 | 美觀大方 | 美しい | 아름다운",
  "easy | 易于操作 | 易於操作 | 操作が簡単 | 사용하기 쉬운",
  "intelligent | 智能化 | 智能化 | インテリジェント | 지능형",
  "mental health | 健康益智 | 健康益智 | メンタルヘルス | 정신 건강"
];

const emotionValueOptions = [
  "Comfort | 舒适感 | 舒適感 | 快適さ | 편안함",
  "relax | 放松心情 | 放鬆心情 | リラックス | 이완",
  "refreshing | 提神醒脑 | 提神醒腦 | 爽快感 | 상쾌함",
  "happiness | 愉悦感 | 愉悅感 | 幸福感 | 행복",
  "confidence | 自信提升 | 自信提升 | 自信の向上 | 자신감 상승",
  "sweet | 温馨感 | 溫馨感 | 甘さ | 달콤함",
  "novelty | 新鲜感 | 新鮮感 | 新規性 | 신선함",
  "security | 安全感 | 安全感 | 安全性 | 안전함",
  "advanced sense | 高级感 | 高級感 | 高級感 | 고급스러움",
  "belonging | 归属感 | 歸屬感 | 帰属感 | 소속감"
];

export default function MarketingPage() {
  const [content, setContent] = useState('');
  const [productValues, setProductValues] = useState<string[]>([]);
  const [emotionValues, setEmotionValues] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [wordCount, setWordCount] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !productValues.length || !emotionValues.length || !wordCount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          productValues,
          emotionValues,
          ageRange,
          wordCount: parseInt(wordCount)
        } as MarketingContent)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulated = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        accumulated += text;
        setGeneratedContent(accumulated);
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedContent('Sorry, there was an error generating the content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Marketing Content Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Product Description</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-lg min-h-[100px]"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Product Values</label>
          <select
            multiple
            value={productValues}
            onChange={(e) => setProductValues(Array.from(e.target.selectedOptions, option => option.value))}
            className="w-full p-2 border rounded-lg min-h-[100px]"
            required
          >
            {productValueOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Emotional Values</label>
          <select
            multiple
            value={emotionValues}
            onChange={(e) => setEmotionValues(Array.from(e.target.selectedOptions, option => option.value))}
            className="w-full p-2 border rounded-lg min-h-[100px]"
            required
          >
            {emotionValueOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Age Range</label>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              min="0"
              max={ageRange[1]}
              value={ageRange[0]}
              onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
              className="w-24 p-2 border rounded-lg"
            />
            <span>to</span>
            <input
              type="number"
              min={ageRange[0]}
              max="100"
              value={ageRange[1]}
              onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
              className="w-24 p-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Minimum Word Count</label>
          <input
            type="number"
            min="1"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {(isLoading || generatedContent) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Generated Content</h2>
          <div className="bg-white rounded-lg shadow p-6">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{generatedContent}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}