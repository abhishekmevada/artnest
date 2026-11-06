export const REVENUE = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 51000 },
  { month: "Mar", revenue: 48000 }, { month: "Apr", revenue: 63000 },
  { month: "May", revenue: 72000 }, { month: "Jun", revenue: 68000 },
  { month: "Jul", revenue: 81000 }, { month: "Aug", revenue: 75000 },
  { month: "Sep", revenue: 89000 },
];

export const ARTISTS = [
  { id: "A-101", name: "Aarav Mehta", specialty: "Paintings", city: "Jaipur", works: 42, sales: 612000, status: "Active" },
  { id: "A-102", name: "Riya Sharma", specialty: "Digital Art", city: "Mumbai", works: 35, sales: 498000, status: "Active" },
  { id: "A-103", name: "Kabir Verma", specialty: "Sculpture", city: "Pune", works: 21, sales: 741000, status: "Active" },
  { id: "A-104", name: "Ananya Kapoor", specialty: "Abstract", city: "Delhi", works: 29, sales: 356000, status: "Pending" },
  { id: "A-105", name: "Meera Iyer", specialty: "Photography", city: "Kochi", works: 18, sales: 214000, status: "Blocked" },
];

export const ARTWORKS = [
  { id: "AW-1", title: "Golden Silence", artist: "Aarav Mehta", category: "Painting", price: 18500, status: "Approved" },
  { id: "AW-2", title: "Monsoon Reverie", artist: "Riya Sharma", category: "Digital Art", price: 32400, status: "Approved" },
  { id: "AW-3", title: "City in Ochre", artist: "Ananya Kapoor", category: "Abstract", price: 21800, status: "Pending" },
  { id: "AW-4", title: "Still Water Study", artist: "Meera Iyer", category: "Photography", price: 15600, status: "Pending" },
  { id: "AW-5", title: "Ink and Rust", artist: "Riya Sharma", category: "Digital Art", price: 12400, status: "Rejected" },
];

export const SCULPTURES = [
  { id: "SC-1", title: "Bronze Whisper", artist: "Kabir Verma", material: "Cast Bronze", price: 64200, status: "Approved" },
  { id: "SC-2", title: "Marble Repose", artist: "Kabir Verma", material: "Carved Marble", price: 98000, status: "Approved" },
  { id: "SC-3", title: "Terracotta Dream", artist: "Meera Iyer", material: "Terracotta", price: 15600, status: "Pending" },
  { id: "SC-4", title: "Walnut Relief", artist: "Aarav Mehta", material: "Carved Wood", price: 23500, status: "Rejected" },
];

export const COLLECTIONS = [
  { id: "C-1", name: "Monsoon Moods", items: 14, curator: "Editorial team", status: "Published" },
  { id: "C-2", name: "Quiet Interiors", items: 9, curator: "Editorial team", status: "Published" },
  { id: "C-3", name: "Festive Gifting", items: 22, curator: "Priya N.", status: "Draft" },
  { id: "C-4", name: "First-time Collectors", items: 12, curator: "Priya N.", status: "Draft" },
];

export const ORDERS = [
  { id: "ORD-10245", buyer: "Priya Sharma", item: "Golden Silence", amount: 18500, date: "18 Sep 2026", status: "Completed" },
  { id: "ORD-10244", buyer: "Rahul Kapoor", item: "Monsoon Reverie", amount: 32400, date: "18 Sep 2026", status: "Processing" },
  { id: "ORD-10243", buyer: "Sneha Iyer", item: "Bronze Whisper", amount: 64200, date: "17 Sep 2026", status: "Pending" },
  { id: "ORD-10242", buyer: "Vikram Nair", item: "City in Ochre", amount: 21800, date: "17 Sep 2026", status: "Completed" },
  { id: "ORD-10241", buyer: "Ishaan Joshi", item: "Terracotta Dream", amount: 15600, date: "16 Sep 2026", status: "Cancelled" },
];

export const REQUESTS = [
  { id: "CR-301", buyer: "Rahul Kapoor", artist: "Aarav Mehta", brief: "Family portrait, 24x30 in", budget: 45000, status: "New" },
  { id: "CR-300", buyer: "Sneha Iyer", artist: "Kabir Verma", brief: "Garden bronze piece", budget: 120000, status: "In Progress" },
  { id: "CR-299", buyer: "Divya Menon", artist: "Riya Sharma", brief: "Logo-inspired digital print", budget: 18000, status: "Completed" },
  { id: "CR-298", buyer: "Kunal Bose", artist: "Ananya Kapoor", brief: "Office lobby mural", budget: 250000, status: "Rejected" },
];

export const PAYMENTS = [
  { id: "PAY-501", order: "ORD-10245", artist: "Aarav Mehta", amount: 16650, method: "UPI", status: "Paid" },
  { id: "PAY-500", order: "ORD-10244", artist: "Riya Sharma", amount: 29160, method: "Card", status: "Pending" },
  { id: "PAY-499", order: "ORD-10242", artist: "Ananya Kapoor", amount: 19620, method: "Net banking", status: "Paid" },
  { id: "PAY-498", order: "ORD-10241", artist: "Meera Iyer", amount: 14040, method: "UPI", status: "Failed" },
];

export const USERS = [
  { id: "U-1", name: "Priya Sharma", email: "priya@example.com", orders: 6, joined: "12 Jan 2026", status: "Active" },
  { id: "U-2", name: "Rahul Kapoor", email: "rahul@example.com", orders: 3, joined: "03 Mar 2026", status: "Active" },
  { id: "U-3", name: "Sneha Iyer", email: "sneha@example.com", orders: 1, joined: "21 Jun 2026", status: "Active" },
  { id: "U-4", name: "Ishaan Joshi", email: "ishaan@example.com", orders: 0, joined: "09 Aug 2026", status: "Blocked" },
];

export const REVIEWS = [
  { id: "R-1", artwork: "Golden Silence", buyer: "Priya Sharma", rating: 5, comment: "Even better in person.", status: "Approved" },
  { id: "R-2", artwork: "Monsoon Reverie", buyer: "Rahul Kapoor", rating: 4, comment: "Packaging was excellent.", status: "Pending" },
  { id: "R-3", artwork: "City in Ochre", buyer: "Vikram Nair", rating: 2, comment: "Colours differ from the photo.", status: "Pending" },
  { id: "R-4", artwork: "Ink and Rust", buyer: "Divya Menon", rating: 1, comment: "Spam link removed.", status: "Rejected" },
];

export const MESSAGES = [
  { id: "M-901", from: "Aarav Mehta", role: "Artist", subject: "Payout schedule for Golden Silence", time: "10:42 AM", status: "Unread" },
  { id: "M-900", from: "Priya Sharma", role: "Buyer", subject: "Delivery date for ORD-10245", time: "9:15 AM", status: "Unread" },
  { id: "M-899", from: "Meera Iyer", role: "Artist", subject: "Resubmitting Still Water Study", time: "Yesterday", status: "Read" },
];