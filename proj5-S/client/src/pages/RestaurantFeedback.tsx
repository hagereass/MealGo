import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MessageSquare, Star } from 'lucide-react';
import { getRoleSession, setCurrentUserSession } from '../utils/session';
const API_BASE = 'https://mealgo-production.up.railway.app';

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`);
    return handleResponse(res);
  },

  post: async (url: string, body: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  patch: async (url: string, body?: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  return res.text();
}
interface ReviewItem {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const fallbackRestaurantId = '77777777-7777-7777-7777-777777777771';

export default function RestaurantFeedback() {
  const [restaurantId, setRestaurantId] = useState(fallbackRestaurantId);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getRoleSession('restaurant');
    if (!user) return;
    setCurrentUserSession(user);
    setRestaurantId(user.restaurantId || fallbackRestaurantId);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/reviews`);
        if (!response.ok) {
          setReviews([]);
          return;
        }
        const data = await response.json();
        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="restaurant" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Customer Feedback</h1>
          <p className="text-gray-600">See what customers are saying about your restaurant.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center text-gray-500 shadow-sm">Loading feedback...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef2ef] text-[#e95322] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg">{review.customer}</div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${review.id}-${index}`}
                            className={`w-4 h-4 ${index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{review.comment || 'No written feedback'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString('en-US')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center text-gray-500 shadow-sm">No feedback yet.</div>
        )}
      </div>
    </div>
  );
}
