"use client";
import { useState, useEffect, useRef } from "react";
import { Whatsapp } from "iconsax-react";
import { Globe, Mail, MapPin, PhoneCall, User, QrCode, Download, Copy, Building } from "lucide-react";
import ReactQRCode from "react-qr-code";
import { getQRPreviewData } from "@/lib/api/qr-preview";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

const QRCode = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [qrData, setQrData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    siteSlug: ""
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Load QR data
  useEffect(() => {
    loadQRData();
  }, []);

  const loadQRData = async () => {
    setIsLoading(true);
    try {
      const response = await getQRPreviewData();
      
      if (response?.success && response.data) {
        setQrData(response.data);
      } else {
        console.error("Failed to load QR data:", response?.message);
        toast.error(response?.message || "Failed to load QR code data");
      }
    } catch (error) {
      console.error("Failed to load QR data:", error);
      toast.error("Failed to load QR code data");
    }
    setIsLoading(false);
  };

  const qrValue = `https://mysaas.com/${qrData.siteSlug}`;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">Digital Visiting Card</h3>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm">
          View your professional visiting card with QR code
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contact Details Card - LEFT SIDE */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="mb-6 sm:mb-8">
            <div className="text-center mb-4 sm:mb-6">
              <h4 className="text-white text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                {qrData.name || "Your Name"}
              </h4>
              <div className="bg-blue-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full inline-block">
                <span className="text-xs sm:text-sm font-semibold">CEO & FOUNDER</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Phone */}
            {qrData.phone && (
              <div className="p-2 sm:p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="bg-blue-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneCall size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Phone</p>
                  </div>
                </div>
                <p className="text-white font-medium text-sm sm:text-base ml-10 sm:ml-13">{qrData.phone}</p>
              </div>
            )}

            {/* WhatsApp */}
            {qrData.whatsapp && (
              <div className="p-2 sm:p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="bg-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Whatsapp size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">WhatsApp</p>
                  </div>
                </div>
                <p className="text-white font-medium text-sm sm:text-base ml-10 sm:ml-13">{qrData.whatsapp}</p>
              </div>
            )}

            {/* Email */}
            {qrData.email && (
              <div className="p-2 sm:p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="bg-red-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Email</p>
                  </div>
                </div>
                <p className="text-white font-medium text-sm sm:text-base ml-10 sm:ml-13">{qrData.email}</p>
              </div>
            )}

            {/* Website */}
            <div className="p-2 sm:p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="bg-purple-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Website</p>
                </div>
              </div>
              <p className="text-white font-medium text-sm sm:text-base ml-10 sm:ml-13">mysaas.com/{qrData.siteSlug || "your-site"}</p>
            </div>

            {/* Address - Flexible layout for long addresses */}
            {qrData.address && (
              <div className="p-2 sm:p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-start gap-2 sm:gap-3 mb-1">
                  <div className="bg-orange-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Address</p>
                  </div>
                </div>
                <p className="text-white font-medium text-sm sm:text-base ml-10 sm:ml-13 whitespace-pre-line">
                  {qrData.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Card - RIGHT SIDE */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 sm:p-4 shadow-lg">
            {/* Visiting Card Preview - Desktop full size, mobile scaled down */}
            <div 
              ref={cardRef}
              className="bg-white rounded-xl shadow-2xl p-3 sm:p-6 mx-auto sm:transform sm:scale-100 origin-center"
              style={{
                width: '100%',
                maxWidth: '350px',
                height: '200px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div className="flex h-full gap-2 sm:gap-3">
                {/* Left side - Contact info (Flexible width) */}
                <div className="flex-1 min-w-0">
                  {/* Name & Title */}
                  <div className="mb-1 sm:mb-2">
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                      {qrData.name || "Your Name"}
                    </h2>
                    <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">
                      CEO & FOUNDER
                    </p>
                  </div>

                  {/* Contact Info with Icons - Flexible for long text */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {/* Phone with Icon */}
                    {qrData.phone && (
                      <div className="flex items-start gap-1">
                        <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-xs text-gray-800 font-medium break-words flex-1">
                          {qrData.phone}
                        </span>
                      </div>
                    )}

                    {/* Email with Icon */}
                    {qrData.email && (
                      <div className="flex items-start gap-1">
                        <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-xs text-gray-800 font-medium break-all flex-1">
                          {qrData.email}
                        </span>
                      </div>
                    )}

                    {/* Website with Icon */}
                    <div className="flex items-start gap-1">
                      <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-xs text-blue-600 font-semibold break-words flex-1">
                        mysaas.com/{qrData.siteSlug || "your-site"}
                      </span>
                    </div>

                    {/* Address with Icon - Flexible for long addresses */}
                    {qrData.address && (
                      <div className="flex items-start gap-1">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-xs text-gray-800 font-medium break-words line-clamp-2 sm:line-clamp-none flex-1">
                          {qrData.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - QR Code (Smaller size) */}
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <div className="p-0.5 sm:p-1 bg-white rounded border border-gray-200">
                    <ReactQRCode
                      value={qrValue}
                      size={40}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Preview Label */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-300">Visiting Card Preview</p>
              <p className="text-xs text-gray-400">Standard size: 3.5" × 2"</p>
            </div>

            {/* SEPARATE QR CODE BELOW VISITING CARD */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
              <div className="flex flex-col items-center justify-center">
                <h4 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">Scan QR Code</h4>
                <div className="p-2 sm:p-4 bg-white rounded-lg">
                  <ReactQRCode
                    value={qrValue}
                    size={80}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                <p className="text-gray-300 text-xs sm:text-sm font-medium mt-2 sm:mt-3 text-center">
                  Scan to visit: mysaas.com/{qrData.siteSlug || "your-site"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCode;