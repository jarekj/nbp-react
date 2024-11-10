import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Check } from 'lucide-react';

interface Rate {
  currency: string;
  code: string;
  mid: number;
}

interface ExchangeRateTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: Rate[];
}

const PRIORITY_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

function App() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rates, setRates] = useState<ExchangeRateTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRate, setCopiedRate] = useState<string | null>(null);

  const fetchRates = async (selectedDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.nbp.pl/api/exchangerates/tables/A/${selectedDate}/?format=json`
      );
      
      if (!response.ok) {
        throw new Error('Brak kursów dla wybranej daty, weekend albo święta. Wybierz inną datę.');
      }
      
      const data = await response.json();
      setRates(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(date);
  }, [date]);

  const sortRates = (rates: Rate[]) => {
    return [...rates].sort((a, b) => {
      const aIndex = PRIORITY_CURRENCIES.indexOf(a.code);
      const bIndex = PRIORITY_CURRENCIES.indexOf(b.code);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const handleCopyRate = (rate: number) => {
    const formattedRate = rate.toFixed(4).replace('.', ',');
    navigator.clipboard.writeText(formattedRate);
    setCopiedRate(formattedRate);
    setTimeout(() => setCopiedRate(null), 1500);
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(4).replace('.', ',');
  };

  return (
    <div className="w-[600px] min-h-[400px] bg-gradient-to-br from-blue-50 to-gray-50 px-6 py-1">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            NBP sprawdź kursy walut
          </h1>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-400"
            />
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r-md animate-fadeIn">
            {error}
          </div>
        )}

        {rates && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Exchange Rates for {rates.effectiveDate}
              </h2>
              <p className="text-sm text-gray-500">Table {rates.no}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waluta
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      kod waluty
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kurs (PLN)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortRates(rates.rates).map((rate, index) => (
                    <tr 
                      key={rate.code}
                      className={`hover:bg-blue-50 transition-colors duration-150 ${
                        PRIORITY_CURRENCIES.includes(rate.code) ? 'bg-blue-50/30' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeIn 0.5s ease-out forwards'
                      }}
                    >
                      <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900">
                        {rate.currency}
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-blue-600">
                        {rate.code}
                      </td>
                      <td 
                        className="px-6 py-1 whitespace-nowrap text-sm text-right font-mono text-gray-900 cursor-pointer group relative"
                        onClick={() => handleCopyRate(rate.mid)}
                      >
                        <span className="hover:text-blue-600 transition-colors">
                          {formatRate(rate.mid)}
                        </span>
                        {copiedRate === formatRate(rate.mid) && (
                          <span className="absolute right-16 top-1/2 -translate-y-1/2 text-green-600 flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-green-100 animate-fadeIn">
                            <Check className="w-3 h-3" />
                            Copied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;