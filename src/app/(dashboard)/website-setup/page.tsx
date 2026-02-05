"use client";

import { useEffect, useState, useRef } from "react";
import { getTemplateSettings, updateTemplateSettings } from "@/lib/api/template-settings";
import { templates } from "@/constants/templates";
import { 
  Check, 
  Eye, 
  Sparkles, 
  Loader2, 
  ExternalLink,
  Zap,
  Layout,
  Palette,
  TrendingUp,
  Rocket,
  Award,
  ShieldCheck
} from "lucide-react";

export default function Settings() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const [scrollPos, setScrollPos] = useState<{ [key: number]: number }>({});
  const animRefs = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    async function load() {
      const res = await getTemplateSettings();
      if (res.success) setSelected(res.template);
    }
    load();
  }, []);

  const apply = async (tpl: number) => {
    setLoading(tpl);
    const res = await updateTemplateSettings(tpl);
    setLoading(null);

    if (res.success) {
      setSelected(tpl);
    } else {
      console.error("Template apply failed:", res.message);
    }
  };

  const startScroll = (id: number) => {
    const animate = () => {
      setScrollPos((prev) => {
        const current = prev[id] || 0;
        const next = current + 1.5; // Even smoother scroll

        return {
          ...prev,
          [id]: next > 250 ? 0 : next,
        };
      });

      animRefs.current[id] = requestAnimationFrame(animate);
    };

    animRefs.current[id] = requestAnimationFrame(animate);
  };

  const stopScroll = (id: number) => {
    cancelAnimationFrame(animRefs.current[id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-30 rounded-full"></div>
              <div className="relative p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Layout className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Premium Templates
            </h1>
          </div>
        </div>



        {/* Templates Grid - Fixed Image Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {templates.map((tpl) => {
            const offset = scrollPos[tpl.id] || 0;
            const isSelected = selected === tpl.id;
            const isLoading = loading === tpl.id;

            return (
              <div
                key={tpl.id}
                className={`group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl ${
                  isSelected 
                    ? "border-blue-500 shadow-md sm:shadow-lg shadow-blue-100/50 ring-1 sm:ring-2 ring-blue-500 ring-opacity-20" 
                    : "border-gray-100 hover:border-gray-300"
                }`}
                onMouseEnter={() => {
                  setHovered(tpl.id);
                  startScroll(tpl.id);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  stopScroll(tpl.id);
                }}
              >
                {/* Premium Badge */}
                {tpl.featured && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden xs:inline">Best Seller</span>
                      <span className="xs:hidden">Best</span>
                    </div>
                  </div>
                )}

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden xs:inline">Active</span>
                    </div>
                  </div>
                )}

                {/* Template Preview Container - Fixed */}
                <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50" />
                  
                  {/* Preview overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-sm rounded-full p-3 sm:p-4 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>

                  {/* Scrollable image with proper constraints */}
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={tpl.thumbnail}
                      alt={`${tpl.name} Preview`}
                      className={`absolute inset-0 w-full h-auto min-h-full object-cover transition-transform duration-700 ease-out ${
                        hovered === tpl.id ? 'scale-105' : 'scale-100'
                      }`}
                      style={{ 
                        transform: `translateY(-${offset}px) scale(${hovered === tpl.id ? 1.05 : 1})`,
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Bottom gradient fade - more subtle */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />
                </div>

                {/* Template Info */}
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {tpl.name}
                      </h3>
                      
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {tpl.description || "Professional template optimized for conversions"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                    <a
                      href={`/templates/${tpl.id}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium text-xs sm:text-sm group/link"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Live Preview</span>
                    </a>

                    {isSelected ? (
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm cursor-default shadow-sm"
                        disabled
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Applied</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => apply(tpl.id)}
                        disabled={!!loading}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <>
                            <span>Apply Template</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Signals */}
        <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Trusted by Thousands of Users</h2>
            <p className="text-gray-600 text-sm sm:text-base">Join successful businesses using our templates</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">+47%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Average Conversion Increase</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Templates optimized for maximum conversions</p>
            </div>

            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">&lt;1s</div>
                  <div className="text-xs sm:text-sm text-gray-600">Load Time</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Lightning fast performance for better SEO</p>
            </div>

            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Customizable</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Full control over colors, fonts, and layout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}