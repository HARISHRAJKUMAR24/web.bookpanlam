"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CreditCard, Stethoscope, Building, FileText, IndianRupee, MapPin, Phone, Mail, Tag, ListChecks } from "lucide-react";

interface AppointmentDetailsCardsProps {
  appointment: any;
}

const AppointmentDetailsCards = ({ appointment }: AppointmentDetailsCardsProps) => {
  if (!appointment) return null;

  console.log("📌 Card component received data:", appointment);
  console.log("📌 Service data:", appointment?.service);

  // Extract data directly from appointment (not appointment.data)
  const data = appointment;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (amount: number | string, currency: string = 'INR') => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return '₹0.00';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
      }).format(numAmount);
    } catch (error) {
      return '₹0.00';
    }
  };

  // Parse service data - check if we need to parse raw JSON or use already parsed service object
  const parseServiceDetails = () => {
    // First check if service object already exists (from PHP backend parsing)
    if (data.service && data.service.rawData) {
      const serviceData = data.service.rawData;
      
      if (serviceData.type === 'department') {
        // For department: Extract services list
        const servicesList = serviceData.services || [];
        const services = servicesList.map((service: any) => ({
          name: service.name,
          price: service.price,
          quantity: service.quantity,
          hsn: service.hsn
        }));
        
        return {
          type: 'department',
          displayName: serviceData.department_name || data.service.name || 'Department',
          services: services,
          departmentId: serviceData.department_id
        };
      } else if (serviceData.type === 'category') {
        // For category: Show doctor details
        return {
          type: 'category',
          displayName: serviceData.doctor_name || data.service.name || 'Doctor Consultation',
          services: [], // No service list for category
          doctorName: serviceData.doctor_name,
          specialization: serviceData.specialization,
          serviceType: serviceData.service_type
        };
      }
    }
    
    // Fallback: parse from service_name if service object doesn't exist
    const serviceName = data.service_name;
    if (!serviceName) return { services: [], type: 'unknown', displayName: 'N/A' };

    try {
      if (serviceName.startsWith('{')) {
        const serviceData = JSON.parse(serviceName);
        
        if (serviceData.type === 'department') {
          const servicesList = serviceData.services || [];
          const services = servicesList.map((service: any) => ({
            name: service.name,
            price: service.price,
            quantity: service.quantity,
            hsn: service.hsn
          }));
          
          return {
            type: 'department',
            displayName: serviceData.department_name || 'Department',
            services: services,
            departmentId: serviceData.department_id
          };
        } else if (serviceData.type === 'category') {
          return {
            type: 'category',
            displayName: serviceData.doctor_name || 'Doctor Consultation',
            services: [],
            doctorName: serviceData.doctor_name,
            specialization: serviceData.specialization,
            serviceType: serviceData.service_type
          };
        }
      }
      
      return {
        type: 'unknown',
        displayName: serviceName,
        services: []
      };
    } catch (error) {
      console.error("Error parsing service data:", error);
      return {
        type: 'unknown',
        displayName: serviceName,
        services: []
      };
    }
  };

  const serviceDetails = parseServiceDetails();
  console.log("📌 Parsed service details:", serviceDetails);

  // Use service object if available, otherwise use parsed details
  const serviceType = data.service?.type || data.service_reference_type || serviceDetails.type;
  const doctorName = data.service?.doctorName || serviceDetails.doctorName;
  const specialization = data.service?.specialization || serviceDetails.specialization;
  const serviceName = data.service?.name || data.service_name || serviceDetails.displayName;

  return (
    <div className="space-y-5">

      {/* Payment Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Payment Method</p>
              <Badge variant="outline" className="uppercase">
                {data.paymentMethod || data.payment_method || 'N/A'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Base Amount</p>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatCurrency(data.amount, data.currency)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount</p>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatCurrency(data.total_amount, data.currency)}</p>
              </div>
            </div>
            {(data.gstPercentage > 0 || data.gst_percent > 0) && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">GST ({data.gstPercentage || data.gst_percent}%)</p>
                <p className="font-medium">{formatCurrency(data.gst_amount, data.currency)}</p>
              </div>
            )}
          </div>

          {data.paymentId && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Payment ID</p>
              <p className="font-medium font-mono text-sm">{data.paymentId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Appointment ID</p>
              <p className="font-medium">{data.appointmentId || data.appointment_id || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatDate(data.date || data.appointment_date)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Time</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="font-medium">
                  {data.time ? `${formatTime(data.time)}` : 'N/A'}
                  {data.slot_to && ` - ${formatTime(data.slot_to)}`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={`${getStatusColor(data.status)} font-medium`}>
                {data.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Booked Date</p>
              <p className="font-medium">{formatDate(data.createdAt || data.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Token Count</p>
              <p className="font-medium">{data.tokenCount || data.token_count || 1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.customer || data.name ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{data.customer?.name || data.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="font-medium">{data.customer?.customerId || data.customer_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{data.customer?.email || data.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{data.customer?.phone || data.phone || 'N/A'}</p>
                  </div>
                </div>
                {(data.customer?.photo || data.photo) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Photo</p>
                    <img
                      src={data.customer?.photo || data.photo}
                      alt="Customer"
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer information available</p>
          )}
        </CardContent>
      </Card>

      {/* Service Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {serviceType === 'department' || data.service_reference_type === 'department' ? (
              <Building className="h-5 w-5" />
            ) : (
              <Stethoscope className="h-5 w-5" />
            )}
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.service || data.service_reference_id || data.service_name ? (
            <div className="space-y-4">
              {serviceType !== 'department' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {doctorName && (
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-medium">{doctorName}</p>
                    </div>
                  )}
                  {specialization && (
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium">{specialization}</p>
                    </div>
                  )}
                  {!specialization && doctorName && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-400">Not specified</p>
                    </div>
                  )}
                </div>
              )}

              {serviceDetails.type === 'department' && serviceDetails.services.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">Services Booked</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceDetails.services.map((service: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            {service.hsn && (
                              <p className="text-xs text-gray-500 mt-1">HSN: {service.hsn}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatCurrency(service.price)}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {service.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No service information available</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AppointmentDetailsCards;