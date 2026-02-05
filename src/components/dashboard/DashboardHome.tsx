import {
  DollarCircle,
  CalendarTick,
  TaskSquare,
  Profile2User,
  Calendar,
  Chart,
} from "iconsax-react";

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
  const revenueData = await getRevenue("7");
  const overviewData = await getOverview();
  const todayAppointments = await getTodayAppointments();
  const todayData = await getTodayAppointments();

  // OVERVIEW STATS
  const overviewStats = [
    {
      value: abbreviateNumber(overviewData.totalRevenue),
      label: "Total Revenue",
      icon: <DollarCircle />,
    },
    {
      value: abbreviateNumber(overviewData.totalAppointments),
      label: "Appointments",
      icon: <CalendarTick />,
    },
    {
      value: abbreviateNumber(overviewData.totalCustomers),
      label: "Total Customers",
      icon: <Profile2User />,
    },
    {
      value: abbreviateNumber(overviewData.totalServices),
      label: "Total Services",
      icon: <TaskSquare />,
    },
    {
      value: abbreviateNumber(overviewData.totalEmployees),
      label: "Total Employees",
      icon: <Profile2User />,
    },
    {
      value: todayData.paid,
      label: "Today's Paid Appointments",
      icon: <Calendar />,
    },
    {
      value: todayData.pending,
      label: "Today's Pending Appointments",
      icon: <Calendar />,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* PLAN RENEWAL MESSAGE */}
      {showRenewalMessage && (
        <div
          className={`rounded-lg md:rounded-xl p-4 md:p-6 ${renewalMessageType === "danger"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : renewalMessageType === "warning"
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            } text-white shadow-lg`}
        >
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-bold md:font-extrabold text-xl md:text-3xl tracking-wide mb-2 uppercase">
              {planStatus?.plan_expired ? "Plan Expired" : "Plan Expiring Soon"}
            </h3>

            <div className="w-12 md:w-16 h-1 bg-white/40 rounded-full mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-lg font-medium leading-relaxed mb-4 md:mb-6 text-white/95">
              {renewalMessage}
            </p>

            <div className="flex justify-center">
              <a
                href="/all-plans"
                className={`px-6 md:px-8 py-2 md:py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 text-xs md:text-base ${renewalMessageType === "danger"
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
        <div className="mb-4 md:mb-6">
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
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Overview</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {overviewStats.slice(0, 4).map((item, i) => (
          <Stats key={i} {...item} />
        ))}
      </div>

      {/* Additional stats cards for smaller screens - show in separate row */}
      {overviewStats.length > 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {overviewStats.slice(4).map((item, i) => (
            <Stats key={i + 4} {...item} />
          ))}
        </div>
      )}

      {/* GRAPH + QUICK LINKS */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
        {/* Graph Section */}
        <div className="lg:w-[70%] xl:w-[70%] min-h-[350px] md:min-h-[420px] w-full">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
              Revenue Overview
            </h2>
            <div className="h-[280px] md:h-[320px]">
              <RevenueGraph chartData={revenueData} />
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="lg:w-[30%] xl:w-[30%] space-y-3 md:space-y-4 w-full">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-5">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
              Quick Links
            </h3>
            <div className="space-y-3">
              <CopyLink
                text="Site Link"
                link={user?.siteSlug ? `${siteUrl}/${user.siteSlug}` : "#"}
                disabled={!user?.siteSlug}
              />

              <LinkCard
                title={`${overviewData.totalAppointments} Appointments`}
                icon={<Calendar size="20" />}
                link="/appointments"
                compact={true}
              />

              <LinkCard
                title="Explore Reports"
                icon={<Chart size="20" />}
                link="/reports"
                compact={true}
              />

              <LinkCard
                title="Start your online store"
                icon={
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
                    <Image
                      src={`${siteimages_uploadsUrl}/ztorespot_logo.jpg`}
                      alt="Ztorespot"
                      width={32}
                      height={32}
                      className="object-cover"
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

      {/* Mobile-only additional stats (optional) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {todayData.paid + todayData.pending}
              </p>
            </div>
            <Calendar className="text-blue-500" size="24" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {todayData.paid}
              </p>
            </div>
            <Calendar className="text-green-500" size="24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;