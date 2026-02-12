import {
  DollarCircle,
  CalendarTick,
  TaskSquare,
  Profile2User,
  Calendar,
  Chart,
} from "iconsax-react";
import RevenueChartToggle from "@/components/charts/revenue-chart-toggle";

import { abbreviateNumber } from "@/lib/utils";
import Stats from "@/components/cards/stats";
import RevenueGraph from "@/components/charts/revenue-graph";
import { getOverview, getRevenue, getTodayAppointments } from "@/lib/api/analytics";
import CopyLink from "@/components/cards/copy-link";
import LinkCard from "@/components/cards/link-card";
import { siteUrl, uploadsUrl, siteimages_uploadsUrl } from "@/config";
import Image from "next/image";
import { currentUser } from "@/lib/api/users";

// Import the slideshow component
import DashboardMessageSlide from "@/components/cards/dashboard-message-slide";
import { getDashboardMessage } from "@/lib/api/dashboard-message";
// Import plan status API
import { getPlanUpgradeStatus } from "@/lib/api/plans";

const DashboardHome = async () => {
  const user = await currentUser();

  // PLAN STATUS
  let planStatus = null;
  let showRenewalMessage = false;
  let renewalMessage = "";
  let renewalMessageType = "";

  if (user?.user_id) {
    try {
      const planResponse = await getPlanUpgradeStatus(user.user_id);
      if (planResponse.success) {
        planStatus = planResponse.user_data;

        if (planStatus.plan_expired) {
          showRenewalMessage = true;
          renewalMessage =
            "Your subscription plan has expired. Renew now to continue using all features.";
          renewalMessageType = "danger";
        } else if (planStatus.plan_status === "expiring_soon") {
          showRenewalMessage = true;
          renewalMessage = planStatus.expiry_message;
          renewalMessageType = "warning";
        }
      }
    } catch (error) {
      console.error("Error fetching plan status:", error);
    }
  }

  // DASHBOARD MESSAGES
  const dashboardMessages = user?.user_id
    ? await getDashboardMessage(user.user_id)
    : [];

  // MAIN API CALLS
  const overviewData = await getOverview();
  const todayAppointments = await getTodayAppointments();
  const todayData = await getTodayAppointments();
  const revenueData = await getRevenue("month", 30); // Default to monthly view

  // OVERVIEW STATS
  const overviewStats = [
    {
      value: abbreviateNumber(overviewData.totalRevenue),
      label: "Total Revenue",
      icon: <DollarCircle className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: abbreviateNumber(overviewData.totalAppointments),
      label: "Appointments",
      icon: <CalendarTick className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: abbreviateNumber(overviewData.totalCustomers),
      label: "Total Customers",
      icon: <Profile2User className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: abbreviateNumber(overviewData.totalServices),
      label: "Total Services",
      icon: <TaskSquare className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: abbreviateNumber(overviewData.totalEmployees),
      label: "Total Employees",
      icon: <Profile2User className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: todayData.paid,
      label: "Today's Paid Appointments",
      icon: <Calendar className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      value: todayData.pending,
      label: "Today's Pending Appointments",
      icon: <Calendar className="w-5 h-5 md:w-6 md:h-6" />,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* PLAN RENEWAL MESSAGE */}
      {showRenewalMessage && (
        <div
          className={`rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 ${renewalMessageType === "danger"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : renewalMessageType === "warning"
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            } text-white shadow-lg`}
        >
          <div className="text-center max-w-xl mx-auto px-2 sm:px-4">
            <h3 className="font-bold md:font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wide mb-2 uppercase">
              {planStatus?.plan_expired ? "Plan Expired" : "Plan Expiring Soon"}
            </h3>

            <div className="w-12 md:w-16 h-1 bg-white/40 rounded-full mx-auto mb-3 md:mb-4" />
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed mb-4 md:mb-6 text-white/95 px-2">
              {renewalMessage}
            </p>

            <div className="flex justify-center">
              <a
                href="/all-plans"
                className={`px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-xs sm:text-sm md:text-base ${renewalMessageType === "danger"
                    ? "bg-white text-red-600 hover:bg-gray-100"
                    : renewalMessageType === "warning"
                      ? "bg-white text-amber-600 hover:bg-gray-100"
                      : "bg-white text-blue-600 hover:bg-gray-100"
                  }`}
              >
                {planStatus?.plan_expired ? "Renew Now" : "Upgrade Now"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SLIDESHOW */}
      {dashboardMessages && dashboardMessages.length > 0 && (
        <div className="mb-3 sm:mb-4 md:mb-6">
          <DashboardMessageSlide
            messages={dashboardMessages}
            autoPlay={true}
            interval={5000}
            showControls={true}
            showDots={true}
          />
        </div>
      )}

      {/* OVERVIEW TITLE */}
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
        Overview
      </h1>

      {/* STATS CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {overviewStats.slice(0, 4).map((item, i) => (
          <Stats key={i} {...item} />
        ))}
      </div>

      {/* Additional stats cards - Auto layout based on screen size */}
      {overviewStats.length > 4 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {overviewStats.slice(4).map((item, i) => (
            <Stats key={i + 4} {...item} />
          ))}
        </div>
      )}

      {/* GRAPH + QUICK LINKS - Responsive Stack */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
        {/* Graph Section */}
        <div className="lg:w-[70%] xl:w-[70%] min-h-[300px] sm:min-h-[350px] md:min-h-[420px] w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-5 lg:p-6 h-full flex flex-col">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">
              Revenue Overview
            </h2>
            <div className="flex-1 w-full min-h-[200px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px]">
              <RevenueChartToggle chartData={revenueData} />
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="lg:w-[30%] xl:w-[30%] space-y-3 sm:space-y-4 w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 md:p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Quick Links
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <CopyLink
                text="Site Link"
                link={user?.siteSlug ? `${siteUrl}/${user.siteSlug}` : "#"}
                disabled={!user?.siteSlug}
              />

              <LinkCard
                title={`${overviewData.totalAppointments} Appointments`}
                icon={<Calendar size="18" className="sm:w-5 sm:h-5" />}
                link="/appointments"
                compact={true}
              />

              <LinkCard
                title="Explore Reports"
                icon={<Chart size="18" className="sm:w-5 sm:h-5" />}
                link="/reports"
                compact={true}
              />

              <LinkCard
                title="Start your online store"
                icon={
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg overflow-hidden">
                    <Image
                      src={`${siteimages_uploadsUrl}/ztorespot_logo.jpg`}
                      alt="Ztorespot"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                }
                link="https://ztorespot.com"
                className="!bg-purple-500 text-white hover:!bg-purple-600"
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;