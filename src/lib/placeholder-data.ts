// Placeholder data for the entire FoodLab platform

export const currentUser = {
  name: "Rajesh Kumar",
  email: "rajesh@dairyfoods.in",
  avatar: "",
  business: "Kumar Dairy Foods Pvt. Ltd.",
  role: "user" as const,
};

export const categories = [
  { id: "1", name: "Dairy", icon: "milk" as const, count: 24 },
  { id: "2", name: "Beverages", icon: "coffee" as const, count: 18 },
  { id: "3", name: "Grains & Cereals", icon: "wheat" as const, count: 32 },
  { id: "4", name: "Spices", icon: "flame" as const, count: 15 },
  { id: "5", name: "Meat & Poultry", icon: "drumstick" as const, count: 12 },
  { id: "6", name: "Oils & Fats", icon: "droplets" as const, count: 10 },
  { id: "7", name: "Processed Foods", icon: "package" as const, count: 28 },
  { id: "8", name: "Snacks", icon: "cookie" as const, count: 20 },
];

export const products = [
  { id: "1", name: "Full Cream Milk", category: "Dairy", testCount: 8, status: "Active" },
  { id: "2", name: "Refined Sunflower Oil", category: "Oils & Fats", testCount: 12, status: "Active" },
  { id: "3", name: "Basmati Rice", category: "Grains & Cereals", testCount: 6, status: "Active" },
  { id: "4", name: "Turmeric Powder", category: "Spices", testCount: 10, status: "Active" },
  { id: "5", name: "Mango Juice", category: "Beverages", testCount: 9, status: "Active" },
  { id: "6", name: "Chicken Sausages", category: "Meat & Poultry", testCount: 14, status: "Active" },
  { id: "7", name: "Instant Noodles", category: "Processed Foods", testCount: 11, status: "Active" },
  { id: "8", name: "Potato Chips", category: "Snacks", testCount: 7, status: "Active" },
  { id: "9", name: "Paneer", category: "Dairy", testCount: 9, status: "Active" },
  { id: "10", name: "Green Tea", category: "Beverages", testCount: 5, status: "Active" },
];

export const tests = [
  { id: "1", name: "Fat Content Analysis", method: "IS:1479", type: "Chemical", parameters: 3, parametersList: ["Total fat", "Saturated fat", "Trans fat (% w/w)"], usedIn: 5 },
  { id: "2", name: "Total Plate Count", method: "IS:5402", type: "Microbiological", parameters: 1, parametersList: ["Colony forming units per gram (CFU/g)"], usedIn: 12 },
  { id: "3", name: "Moisture Content", method: "IS:1165", type: "Physical", parameters: 1, parametersList: ["Moisture percentage (% w/w)"], usedIn: 18 },
  { id: "4", name: "Acid Value", method: "IS:548", type: "Chemical", parameters: 2, parametersList: ["Acid Value", "Free Fatty Acids"], usedIn: 4 },
  { id: "5", name: "Coliform Count", method: "IS:5401", type: "Microbiological", parameters: 1, parametersList: ["Coliform bacteria count"], usedIn: 10 },
  { id: "6", name: "Protein Content (Kjeldahl)", method: "IS:7219", type: "Chemical", parameters: 2, parametersList: ["Total Nitrogen", "Protein equivalent"], usedIn: 8 },
  { id: "7", name: "Lead Content", method: "IS:5451", type: "Chemical", parameters: 1, parametersList: ["Lead (Pb)"], usedIn: 15 },
  { id: "8", name: "Aflatoxin B1", method: "IS:1656", type: "Chemical", parameters: 1, parametersList: ["Aflatoxin B1"], usedIn: 7 },
  { id: "9", name: "Salmonella Detection", method: "IS:5887", type: "Microbiological", parameters: 1, parametersList: ["Salmonella spp. presence"], usedIn: 6 },
  { id: "10", name: "Viscosity Test", method: "IS:1206", type: "Physical", parameters: 2, parametersList: ["Dynamic Viscosity", "Kinematic Viscosity"], usedIn: 3 },
];

export const laboratories = [
  { id: "1", name: "Chennai Food Testing Laboratory", city: "Chennai", nabl: true, fssai: true, rating: 4.8, priceFrom: 850, testsCount: 120, activeBookings: 34, revenue: 485000 },
  { id: "2", name: "Mumbai Analytical Sciences Lab", city: "Mumbai", nabl: true, fssai: true, rating: 4.6, priceFrom: 950, testsCount: 98, activeBookings: 28, revenue: 392000 },
  { id: "3", name: "Delhi Food Research Institute", city: "New Delhi", nabl: true, fssai: true, rating: 4.7, priceFrom: 800, testsCount: 110, activeBookings: 42, revenue: 567000 },
  { id: "4", name: "Bangalore Quality Labs", city: "Bangalore", nabl: true, fssai: false, rating: 4.3, priceFrom: 750, testsCount: 85, activeBookings: 19, revenue: 234000 },
  { id: "5", name: "Hyderabad Food Safety Centre", city: "Hyderabad", nabl: false, fssai: true, rating: 4.1, priceFrom: 700, testsCount: 72, activeBookings: 15, revenue: 178000 },
  { id: "6", name: "Kolkata Testing Services", city: "Kolkata", nabl: true, fssai: true, rating: 4.5, priceFrom: 900, testsCount: 95, activeBookings: 22, revenue: 312000 },
];

export const bookings = [
  { id: "BK-2024-001", product: "Full Cream Milk", testsCount: 3, lab: "Chennai Food Testing Laboratory", date: "2024-03-15", status: "Completed", amount: 4500, user: "Rajesh Kumar", paymentStatus: "Paid" },
  { id: "BK-2024-002", product: "Basmati Rice", testsCount: 5, lab: "Delhi Food Research Institute", date: "2024-03-18", status: "In Progress", amount: 6200, user: "Priya Sharma", paymentStatus: "Paid" },
  { id: "BK-2024-003", product: "Turmeric Powder", testsCount: 4, lab: "Mumbai Analytical Sciences Lab", date: "2024-03-20", status: "Pending", amount: 3800, user: "Amit Patel", paymentStatus: "Pending" },
  { id: "BK-2024-004", product: "Refined Sunflower Oil", testsCount: 6, lab: "Bangalore Quality Labs", date: "2024-03-22", status: "Approved", amount: 7500, user: "Sunita Reddy", paymentStatus: "Paid" },
  { id: "BK-2024-005", product: "Mango Juice", testsCount: 3, lab: "Chennai Food Testing Laboratory", date: "2024-03-23", status: "Pending", amount: 3200, user: "Vikram Singh", paymentStatus: "Pending" },
  { id: "BK-2024-006", product: "Chicken Sausages", testsCount: 7, lab: "Hyderabad Food Safety Centre", date: "2024-03-10", status: "Completed", amount: 8900, user: "Rajesh Kumar", paymentStatus: "Paid" },
  { id: "BK-2024-007", product: "Paneer", testsCount: 4, lab: "Kolkata Testing Services", date: "2024-03-12", status: "Rejected", amount: 4100, user: "Meera Nair", paymentStatus: "Refunded" },
  { id: "BK-2024-008", product: "Potato Chips", testsCount: 3, lab: "Delhi Food Research Institute", date: "2024-03-14", status: "Completed", amount: 3500, user: "Rahul Gupta", paymentStatus: "Paid" },
];

export const payments = [
  { id: "INV-2024-001", bookingId: "BK-2024-001", lab: "Chennai Food Testing Laboratory", date: "2024-03-15", amount: 4500, status: "Paid", gateway: "Razorpay" },
  { id: "INV-2024-002", bookingId: "BK-2024-002", lab: "Delhi Food Research Institute", date: "2024-03-18", amount: 6200, status: "Paid", gateway: "Razorpay" },
  { id: "INV-2024-003", bookingId: "BK-2024-003", lab: "Mumbai Analytical Sciences Lab", date: "2024-03-20", amount: 3800, status: "Pending", gateway: "-" },
  { id: "INV-2024-004", bookingId: "BK-2024-004", lab: "Bangalore Quality Labs", date: "2024-03-22", amount: 7500, status: "Paid", gateway: "Razorpay" },
  { id: "INV-2024-005", bookingId: "BK-2024-005", lab: "Chennai Food Testing Laboratory", date: "2024-03-23", amount: 3200, status: "Pending", gateway: "-" },
  { id: "INV-2024-006", bookingId: "BK-2024-006", lab: "Hyderabad Food Safety Centre", date: "2024-03-10", amount: 8900, status: "Paid", gateway: "Razorpay" },
  { id: "INV-2024-007", bookingId: "BK-2024-007", lab: "Kolkata Testing Services", date: "2024-03-12", amount: 4100, status: "Refunded", gateway: "Razorpay" },
];

export const users = [
  { id: "1", name: "Rajesh Kumar", business: "Kumar Dairy Foods Pvt. Ltd.", fssai: "10012345000123", mobile: "+91 98765 43210", status: "Active", joined: "2024-01-15" },
  { id: "2", name: "Priya Sharma", business: "Sharma Beverages Co.", fssai: "10012345000456", mobile: "+91 87654 32109", status: "Active", joined: "2024-02-10" },
  { id: "3", name: "Amit Patel", business: "Patel Spice Traders", fssai: "10012345000789", mobile: "+91 76543 21098", status: "Pending Verification", joined: "2024-03-01" },
  { id: "4", name: "Sunita Reddy", business: "Reddy Oils & Fats Ltd.", fssai: "10012345001012", mobile: "+91 65432 10987", status: "Active", joined: "2024-01-28" },
  { id: "5", name: "Vikram Singh", business: "Singh Food Products", fssai: "10012345001345", mobile: "+91 54321 09876", status: "Inactive", joined: "2023-11-20" },
  { id: "6", name: "Meera Nair", business: "Nair's Kitchen Essentials", fssai: "10012345001678", mobile: "+91 43210 98765", status: "Active", joined: "2024-02-22" },
];

export const notifications = [
  { id: "1", title: "Booking Approved", message: "Your booking BK-2024-004 has been approved.", time: "2 min ago", read: false },
  { id: "2", title: "Report Ready", message: "Test report for BK-2024-001 is ready for download.", time: "1 hour ago", read: false },
  { id: "3", title: "Payment Received", message: "Payment of ₹6,200 received for BK-2024-002.", time: "3 hours ago", read: true },
  { id: "4", title: "Lab Update", message: "Testing in progress for BK-2024-002.", time: "Yesterday", read: true },
];

export const labPricing = [
  { id: "1", testName: "Fat Content Analysis", type: "Chemical", price: 1200, lastUpdated: "2024-03-10" },
  { id: "2", testName: "Total Plate Count", type: "Microbiological", price: 850, lastUpdated: "2024-03-08" },
  { id: "3", testName: "Moisture Content", type: "Physical", price: 650, lastUpdated: "2024-03-05" },
  { id: "4", testName: "Acid Value", type: "Chemical", price: 950, lastUpdated: "2024-03-12" },
  { id: "5", testName: "Coliform Count", type: "Microbiological", price: 1100, lastUpdated: "2024-03-01" },
  { id: "6", testName: "Protein Content (Kjeldahl)", type: "Chemical", price: 1500, lastUpdated: "2024-02-28" },
  { id: "7", testName: "Lead Content", type: "Chemical", price: 1800, lastUpdated: "2024-03-15" },
  { id: "8", testName: "Aflatoxin B1", type: "Chemical", price: 2200, lastUpdated: "2024-03-14" },
];
