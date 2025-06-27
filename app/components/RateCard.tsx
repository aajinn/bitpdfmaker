"use client";

interface RateCardProps {
        rating?: number;
        votes?: number;
        toolName?: string;
}

export default function RateCard({
        rating = 4.9,
        votes = 83649,
        toolName = "this tool"
}: RateCardProps) {
        return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm">
                        <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Rate {toolName}
                                </h3>

                                {/* Star Rating - Display Only */}
                                <div className="flex justify-center items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                        key={star}
                                                        className={`text-2xl ${star <= rating
                                                                        ? 'text-yellow-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                >
                                                        ★
                                                </span>
                                        ))}
                                </div>

                                {/* Rating Display */}
                                <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{rating}</span>
                                        <span className="text-gray-500">（{votes.toLocaleString()} votes）</span>
                                </div>
                        </div>
                </div>
        );
} 