import React, { useEffect, useState, useRef } from "react";
import {
  HelpCircle,
  MessageCircle,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus,
  RefreshCw,
  User,
  Shield,
  ShieldCheck,
  X,
  FileText,
  FileCheck,
  Receipt,
  BookOpen,
  Wallet,
  Package,
  Truck,
  Landmark,
  CreditCard,
  AlertTriangle,
  Search,
  ArrowLeft,
  Star,
  Check,
  Headphones,
} from "lucide-react";
import api, { getToken, fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

// 12 Guided Categories with preloaded common issues
const GUIDED_CATEGORIES = [
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    color: "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300",
    issues: [
      "Cannot generate invoice PDF",
      "GST calculation discrepancy",
      "Invoice numbering issue",
      "Invoice sharing or print alignment",
    ],
  },
  {
    id: "quotations",
    label: "Quotations",
    icon: FileCheck,
    color: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:border-cyan-300",
    issues: [
      "Quotation conversion to invoice",
      "Quotation template editing",
      "Expired quotation status",
      "Quotation download error",
    ],
  },
  {
    id: "receipts",
    label: "Money Receipts",
    icon: Receipt,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300",
    issues: [
      "Receipt PDF download error",
      "Payment mode mismatch in receipt",
      "Duplicate receipt created",
      "Receipt serial number issue",
    ],
  },
  {
    id: "khata",
    label: "Khata Ledger",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300",
    issues: [
      "Customer balance discrepancy",
      "Due amount not updating",
      "Entry deletion or edit request",
      "Khata statement export error",
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: Wallet,
    color: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300",
    issues: [
      "Recorded payment not showing in ledger",
      "Payment reconciliation inquiry",
      "Cheque bounce or reversal entry",
      "Payment date or amount mismatch",
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    color: "bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300",
    issues: [
      "Stock quantity mismatch",
      "Product pricing or unit update error",
      "Purchase bill item linking",
      "Low stock alert setting",
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Truck,
    color: "bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300",
    issues: [
      "Trip log entry issue",
      "Driver or vehicle assignment",
      "Waybill / trip print format",
      "Vehicle expense linking",
    ],
  },
  {
    id: "banking",
    label: "Banking",
    icon: Landmark,
    color: "bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-300",
    issues: [
      "Bank account balance adjustment",
      "Transaction export inquiry",
      "Account link error",
      "Bank transfer entry mismatch",
    ],
  },
  {
    id: "billing",
    label: "Billing & Subscription",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-300",
    issues: [
      "Payment deducted but plan inactive",
      "Upgrade or renewal inquiry",
      "GST tax invoice download",
      "Coupon code not applying",
    ],
  },
  {
    id: "account",
    label: "Account & Profile",
    icon: User,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300",
    issues: [
      "Business profile update",
      "Phone or email change request",
      "Password or login assistance",
      "Role and staff permission question",
    ],
  },
  {
    id: "technical",
    label: "Technical Issues",
    icon: AlertTriangle,
    color: "bg-red-50 text-red-600 border-red-200 hover:border-red-300",
    issues: [
      "Slow loading or timeout error",
      "Mobile browser formatting bug",
      "Clear cache or session issue",
      "Data synchronization problem",
    ],
  },
  {
    id: "other",
    label: "Other Inquiries",
    icon: HelpCircle,
    color: "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300",
    issues: [
      "Feature request / suggestion",
      "General query",
      "Speak to support executive",
      "Partnership or enterprise inquiry",
    ],
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "open":
      return (
        <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Open
        </span>
      );
    case "assigned":
      return (
        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Assigned
        </span>
      );
    case "in_progress":
      return (
        <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          In Progress
        </span>
      );
    case "waiting_for_user":
      return (
        <span className="rounded-full bg-orange-100 text-orange-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Waiting for User
        </span>
      );
    case "resolved":
      return (
        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Resolved
        </span>
      );
    case "closed":
      return (
        <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Closed
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {status}
        </span>
      );
  }
};

export default function HelpCentre() {
  const { user } = useAuth();
  const { isRestricted, openSubscriptionPrompt } = useSubscriptionAccess();
  const isStaff = user?.role === "employee" || user?.role === "superadmin";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tickets List State
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [staffTab, setStaffTab] = useState(isStaff ? "available" : "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Customer View State: 'chat' | 'tickets'
  const [customerView, setCustomerView] = useState("chat");
  const [customerFilter, setCustomerFilter] = useState("all"); // 'all' | 'active' | 'resolved'
  const [hasAutoResumed, setHasAutoResumed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [composerMessage, setComposerMessage] = useState("");
  const [composerFile, setComposerFile] = useState(null);
  const [composerLoading, setComposerLoading] = useState(false);
  const [composerError, setComposerError] = useState("");

  // Active Ticket Details & Message State
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  // Post-Resolution Rating State
  const [ratingScore, setRatingScore] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Staff Claiming & Status Updating
  const [claiming, setClaiming] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load Tickets
  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const params = new URLSearchParams();
      if (isStaff && staffTab) params.append("view", staffTab);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await api.get(`/api/help-centre/tickets?${params.toString()}`);
      if (res?.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [staffTab, statusFilter, searchTerm]);

  // Load Single Ticket Details
  const loadTicketDetails = async (ticketId) => {
    try {
      setLoadingMessages(true);
      setSelectedTicketId(ticketId);
      const res = await api.get(`/api/help-centre/tickets/${ticketId}`);
      if (res?.success) {
        setActiveTicket(res.ticket);
        setMessages(res.messages || []);
        setActiveFeedback(res.feedback || null);
        setRatingScore(res.feedback?.rating || 5);
        setRatingComment(res.feedback?.comment || "");
      }
    } catch (err) {
      console.error("Failed to load ticket details:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  // Resume unresolved conversations automatically for customers
  useEffect(() => {
    if (!isStaff && !hasAutoResumed && tickets.length > 0 && !selectedTicketId) {
      const unresolved = tickets.find((t) =>
        ["open", "assigned", "in_progress", "waiting_for_user"].includes(t.status)
      );
      if (unresolved) {
        setHasAutoResumed(true);
        loadTicketDetails(unresolved.id);
      }
    }
  }, [tickets, isStaff, selectedTicketId, hasAutoResumed]);

  const handleStartNewConversation = () => {
    setSelectedTicketId(null);
    setActiveTicket(null);
    setSelectedCategory(null);
    setSelectedIssue("");
    setComposerMessage("");
    setComposerFile(null);
    setComposerError("");
    setCustomerView("chat");
    setHasAutoResumed(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chat Topic Selector: Category click
  const handleSelectCategory = (cat) => {
    if (isRestricted) {
      openSubscriptionPrompt("Help Centre Support");
      return;
    }
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
      setSelectedIssue("");
    } else {
      setSelectedCategory(cat);
      setSelectedIssue("");
    }
  };

  // Chat Topic Selector: Issue click -> toggle selection
  const handleSelectIssue = (cat, issue) => {
    if (isRestricted) {
      openSubscriptionPrompt("Help Centre Support");
      return;
    }
    setSelectedCategory(cat);
    if (selectedIssue === issue) {
      setSelectedIssue("");
    } else {
      setSelectedIssue(issue);
    }
  };

  // Chat-First Composer: Sends first message, creates ticket, and transitions into live chat
  const handleStartConversation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isRestricted) {
      openSubscriptionPrompt("Help Centre Support");
      return;
    }
    const messageText = composerMessage.trim() || selectedIssue;
    if (!messageText) {
      setComposerError("Please select a topic or type your question below.");
      return;
    }

    try {
      setComposerLoading(true);
      setComposerError("");

      const formData = new FormData();
      formData.append("category", selectedCategory?.label || "General");
      formData.append("subcategory", selectedIssue || "General Inquiry");
      formData.append(
        "subject",
        selectedIssue ||
          (composerMessage.trim().length > 60
            ? composerMessage.trim().slice(0, 57) + "..."
            : composerMessage.trim()) ||
          `${selectedCategory?.label || "Support"} Inquiry`
      );
      formData.append(
        "description",
        composerMessage.trim() || `Inquiry regarding ${selectedIssue}`
      );
      if (composerFile) {
        formData.append("attachment", composerFile);
      }

      const token = getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"}/api/help-centre/tickets`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create support ticket.");

      setComposerMessage("");
      setComposerFile(null);
      setSelectedCategory(null);
      setSelectedIssue("");
      await loadTickets();

      if (data?.ticket?.id) {
        await loadTicketDetails(data.ticket.id);
      }
    } catch (err) {
      setComposerError(err.message || "Failed to send message.");
    } finally {
      setComposerLoading(false);
    }
  };

  // Reply in Active Ticket
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !replyFile) return;

    try {
      setSendingReply(true);
      const formData = new FormData();
      formData.append("message", replyText.trim() || "Uploaded an attachment.");
      if (replyFile) formData.append("attachment", replyFile);

      const token = getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"}/api/help-centre/tickets/${activeTicket.id}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post message.");

      setReplyText("");
      setReplyFile(null);
      await loadTicketDetails(activeTicket.id);
    } catch (err) {
      alert(err.message || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  // Claim Ticket (Staff)
  const handleClaimTicket = async (ticketId) => {
    try {
      setClaiming(true);
      const res = await api.post(`/api/help-centre/tickets/${ticketId}/claim`, {});
      if (res?.success) {
        await loadTickets();
        await loadTicketDetails(ticketId);
        if (staffTab === "available") setStaffTab("assigned");
      }
    } catch (err) {
      alert(err.message || "Could not claim this ticket.");
    } finally {
      setClaiming(false);
    }
  };

  // Update Status (Staff)
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/api/help-centre/tickets/${activeTicket.id}/status`, { status: newStatus });
      if (res?.success) {
        await loadTicketDetails(activeTicket.id);
        await loadTickets();
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Submit Feedback / Rating (Customer)
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;

    try {
      setSubmittingFeedback(true);
      const res = await api.post(`/api/help-centre/tickets/${activeTicket.id}/feedback`, {
        rating: ratingScore,
        comment: ratingComment.trim() || null,
      });

      if (res?.success) {
        setFeedbackSuccess(true);
        setActiveFeedback({
          rating: ratingScore,
          comment: ratingComment.trim(),
        });
      }
    } catch (err) {
      alert(err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen bg-slate-50 flex flex-col lg:pl-64">
        {/* Header Blueprint */}
        <PageHeader
          title="Help Centre"
          subtitle="Guided support & instant query resolution"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={false}
          showProfile={true}
        />

        <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col">
          {/* Subscription Restriction Banner for Ordinary Users */}
          {!isStaff && isRestricted && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Subscription Required for Dedicated Support</h3>
                  <p className="text-xs text-slate-600">
                    Please subscribe to get started with full access to live support tickets and expedited agent assistance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openSubscriptionPrompt("Help Centre Support")}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
              >
                <span>View Plans</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[580px]">
            {/* Active Ticket Conversation View */}
            {selectedTicketId && activeTicket ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Conversation Header */}
                <div className="border-b border-slate-100 px-4 sm:px-6 py-3.5 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTicketId(null);
                        setActiveTicket(null);
                        setFeedbackSuccess(false);
                      }}
                      className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-sm transition"
                      title="Back to list"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {activeTicket.ticket_number || `#${activeTicket.id}`}
                        </span>
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                          {activeTicket.subject}
                        </h2>
                        {getStatusBadge(activeTicket.status)}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeTicket.category} • {activeTicket.subcategory || "General"}
                        {isStaff && activeTicket.user_name && ` • Customer: ${activeTicket.user_name} (${activeTicket.user_email || ""})`}
                      </p>
                    </div>
                  </div>

                  {/* Staff Controls */}
                  {isStaff ? (
                    <div className="flex items-center gap-2">
                      {!activeTicket.assigned_employee_id && (
                        <button
                          type="button"
                          disabled={claiming}
                          onClick={() => handleClaimTicket(activeTicket.id)}
                          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm transition disabled:opacity-60"
                        >
                          <CheckCircle2 size={15} />
                          <span>{claiming ? "Claiming..." : "Claim Ticket"}</span>
                        </button>
                      )}

                      <select
                        value={activeTicket.status}
                        disabled={
                          updatingStatus ||
                          (user?.role === "employee" &&
                            (!activeTicket.assigned_employee_id ||
                              activeTicket.assigned_employee_id !== user?.id))
                        }
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-purple-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          user?.role === "employee" && !activeTicket.assigned_employee_id
                            ? "You must claim this ticket before updating status"
                            : user?.role === "employee" && activeTicket.assigned_employee_id !== user?.id
                            ? "Assigned to another team member"
                            : ""
                        }
                      >
                        <option value="open">Open (Unassigned)</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_user">Waiting for User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
                        <Headphones size={15} className="text-purple-600" />
                        <span>KhataNex Support Team</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleStartNewConversation}
                        className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 px-3 py-1.5 text-xs font-bold hover:bg-purple-100 transition shadow-2xs"
                        title="Start a separate conversation"
                      >
                        <Plus size={14} />
                        <span>New Conversation</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                  {loadingMessages ? (
                    <div className="py-16 text-center text-slate-400">
                      <RefreshCw size={22} className="animate-spin inline-block mr-2" />
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      No messages yet. Send a message below to start the conversation.
                    </div>
                  ) : (
                    messages.map((m) => {
                      if (m.is_system) {
                        return (
                          <div key={m.id} className="flex justify-center my-2">
                            <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-medium text-slate-600 text-center max-w-md">
                              {m.message}
                            </span>
                          </div>
                        );
                      }

                      // Check whether message is from staff or customer
                      const isCustomerSender = m.sender_user_role === "user" || m.sender_id === activeTicket.user_id;
                      const isMe = user?.id === m.sender_id;

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                            {/* Mask employee name for customers */}
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              {!isStaff && !isCustomerSender ? (
                                <>
                                  <ShieldCheck size={13} className="text-purple-600" />
                                  <span>KhataNex Support Team</span>
                                </>
                              ) : isMe ? (
                                "You"
                              ) : (
                                m.sender_name || (isCustomerSender ? "Customer" : "Support Team")
                              )}
                            </span>
                            <span>•</span>
                            <span>{new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>

                          <div
                            className={`rounded-2xl px-4 py-3 max-w-lg text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-purple-600 text-white rounded-tr-sm"
                                : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.message}</p>

                            {/* Attachments */}
                            {m.attachments && (
                              <div className="mt-2.5 pt-2 border-t border-black/10">
                                {Array.isArray(m.attachments) ? (
                                  m.attachments.map((att, idx) => (
                                    <a
                                      key={idx}
                                      href={fileUrl(att.path || att)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-black/20 transition"
                                    >
                                      <Paperclip size={12} />
                                      <span>{att.name || "View Attachment"}</span>
                                    </a>
                                  ))
                                ) : (
                                  <a
                                    href={fileUrl(m.attachments)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-black/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-black/20 transition"
                                  >
                                    <Paperclip size={12} />
                                    <span>View Attachment</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Post-Resolution 1-5 Star Rating Section for Customers */}
                  {!isStaff && (activeTicket.status === "resolved" || activeTicket.status === "closed") && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star size={18} className="text-amber-500 fill-amber-400" />
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {activeFeedback || feedbackSuccess ? "Your Feedback & Rating" : "How was your support experience?"}
                          </h4>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                          Resolved
                        </span>
                      </div>

                      {activeFeedback || feedbackSuccess ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={16}
                                className={s <= (activeFeedback?.rating || ratingScore) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                              />
                            ))}
                            <span className="font-bold text-slate-800 text-xs ml-1">
                              {activeFeedback?.rating || ratingScore} / 5 Stars
                            </span>
                          </div>
                          {(activeFeedback?.comment || ratingComment) && (
                            <p className="text-xs text-slate-600 italic mt-1">
                              "{activeFeedback?.comment || ratingComment}"
                            </p>
                          )}
                          <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                            ✓ Thank you for taking the time to share your feedback!
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitFeedback} className="space-y-3">
                          <p className="text-xs text-slate-600">
                            Please rate how well our support team assisted you with this ticket:
                          </p>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingScore(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  size={24}
                                  className={`${
                                    star <= (hoverRating || ratingScore)
                                      ? "fill-amber-400 text-amber-400 scale-110"
                                      : "text-slate-300 hover:text-amber-200"
                                  } transition-all`}
                                />
                              </button>
                            ))}
                            <span className="font-bold text-slate-700 text-xs ml-2">
                              {["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"][
                                (hoverRating || ratingScore) - 1
                              ]}
                            </span>
                          </div>

                          <textarea
                            rows={2}
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Tell us what went well or what could be improved (optional)..."
                            className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs outline-none focus:border-amber-500 shadow-sm"
                          />

                          <button
                            type="submit"
                            disabled={submittingFeedback}
                            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-60"
                          >
                            {submittingFeedback ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                            <span>Submit Feedback</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Composer */}
                {activeTicket.status !== "closed" && (!isRestricted || isStaff) && (
                  <form onSubmit={handleSendReply} className="border-t border-slate-200 p-3 sm:p-4 bg-white">
                    {replyFile && (
                      <div className="flex items-center justify-between mb-2 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs text-purple-900">
                        <span className="truncate max-w-xs">{replyFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setReplyFile(null)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition">
                        <Paperclip size={18} />
                        <input
                          type="file"
                          onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-purple-600 focus:bg-white transition min-h-[44px]"
                      />

                      <button
                        type="submit"
                        disabled={sendingReply || (!replyText.trim() && !replyFile)}
                        className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition disabled:opacity-50"
                        aria-label="Send reply"
                      >
                        {sendingReply ? <RefreshCw size={17} className="animate-spin" /> : <Send size={17} />}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : isStaff ? (
              /* Staff Dashboard: Tickets Roster */
              <div className="flex-1 flex flex-col">
                <div className="border-b border-slate-100 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Staff Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: "available", label: "Available to Claim" },
                      { id: "assigned", label: "Claimed by Me" },
                      { id: "all", label: "All Tickets" },
                      { id: "resolved", label: "Resolved / Closed" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStaffTab(tab.id)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          staffTab === tab.id
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter & Refresh */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tickets..."
                        className="min-h-[40px] rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={loadTickets}
                      className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
                      title="Refresh"
                    >
                      <RefreshCw size={15} className={loadingTickets ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                {/* Staff Tickets Table */}
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Updated</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingTickets ? (
                        <tr>
                          <td colSpan="7" className="py-16 text-center text-slate-400">
                            <RefreshCw size={20} className="animate-spin inline-block mr-2" />
                            Loading tickets...
                          </td>
                        </tr>
                      ) : tickets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-16 text-center text-slate-400">
                            No support tickets found matching the filter.
                          </td>
                        </tr>
                      ) : (
                        tickets.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => loadTicketDetails(t.id)}
                            className="hover:bg-slate-50/70 transition cursor-pointer"
                          >
                            <td className="py-3 px-4">
                              <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                {t.ticket_number || `#${t.id}`}
                              </span>
                              <span className="block font-bold text-slate-900 mt-1">{t.subject}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 block">{t.user_name || "Customer"}</span>
                              <span className="text-[11px] text-slate-400">{t.user_email || t.user_phone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-700 block">{t.category}</span>
                              <span className="text-[10px] text-slate-400">{t.subcategory || "General"}</span>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                            <td className="py-3 px-4">
                              {t.assigned_employee_name ? (
                                <span className="font-semibold text-slate-800">{t.assigned_employee_name}</span>
                              ) : (
                                <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                                  Unclaimed
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {new Date(t.updated_at || t.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadTicketDetails(t.id);
                                }}
                                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-purple-700 hover:bg-purple-50 transition"
                              >
                                View Chat
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Customer Support Experience */
              <div className="flex-1 flex flex-col">
                {/* Customer Sub-Navbar */}
                <div className="border-b border-slate-100 px-4 sm:px-6 py-3 bg-slate-50/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerView("chat")}
                      className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        customerView === "chat"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <MessageCircle size={14} />
                      <span>Chat Support</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerView("tickets")}
                      className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        customerView === "tickets"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>My Tickets</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          customerView === "tickets"
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tickets.length}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={loadTickets}
                    className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
                    title="Refresh"
                  >
                    <RefreshCw size={14} className={loadingTickets ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* View 1: Customer Tickets List */}
                {customerView === "tickets" ? (
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Your Support Conversations</h3>
                        <p className="text-xs text-slate-500">Track current status or resume past support threads</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartNewConversation}
                        className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm min-h-[38px]"
                      >
                        <Plus size={14} />
                        <span>Start New Conversation</span>
                      </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setCustomerFilter("all")}
                        className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-bold transition ${
                          customerFilter === "all"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All ({tickets.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerFilter("active")}
                        className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                          customerFilter === "active"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>Open & In Progress</span>
                        <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                          {tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerFilter("resolved")}
                        className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                          customerFilter === "resolved"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>Resolved</span>
                        <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                          {tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
                        </span>
                      </button>
                    </div>

                    {loadingTickets ? (
                      <div className="py-16 text-center text-slate-400">
                        <RefreshCw size={20} className="animate-spin inline-block mr-2" />
                        Loading your conversations...
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 space-y-3">
                        <MessageCircle size={32} className="mx-auto text-slate-300" />
                        <p className="text-xs">You don't have any support conversations yet.</p>
                        <button
                          type="button"
                          onClick={handleStartNewConversation}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
                        >
                          Start Your First Chat
                        </button>
                      </div>
                    ) : (
                      tickets
                        .filter((t) => {
                          if (customerFilter === "active") return t.status !== "resolved" && t.status !== "closed";
                          if (customerFilter === "resolved") return t.status === "resolved" || t.status === "closed";
                          return true;
                        })
                        .map((t) => (
                          <div
                            key={t.id}
                            onClick={() => loadTicketDetails(t.id)}
                            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-purple-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                  {t.ticket_number || `#${t.id}`}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{t.subject}</h4>
                                {getStatusBadge(t.status)}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {t.description || "Support inquiry"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {t.category} • {t.subcategory || "General"} • Updated{" "}
                                {new Date(t.updated_at || t.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition flex items-center gap-1.5"
                              >
                                <span>{t.status === "resolved" || t.status === "closed" ? "View Chat" : "Resume Chat"}</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                ) : (
                  /* View 2: Chat-First Customer Experience */
                  <div className="flex-1 flex flex-col justify-between h-full bg-slate-50/20">
                    {/* 1 & 2: Conversation / Message History Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                      {/* Support Greeting Bubble */}
                      <div className="flex items-start gap-3 max-w-lg">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                          <Headphones size={18} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              KhataNex Support Team
                            </span>
                            <span className="text-[10px] text-slate-400">Official Assistant</span>
                          </div>
                          <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-xs leading-relaxed space-y-2">
                            <p>
                              Hi there! 👋 How can we help you today?
                            </p>
                            <p className="text-slate-500">
                              Select a business topic below or type your question directly in the chat box to connect with our support team.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Selected Topic Notice if any */}
                      {(selectedCategory || selectedIssue) && (
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/90 px-3.5 py-2 text-xs text-purple-900 shadow-2xs">
                            <span className="font-bold text-purple-700">Selected Topic:</span>
                            <span>
                              {selectedCategory?.label}
                              {selectedIssue ? ` • ${selectedIssue}` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(null);
                                setSelectedIssue("");
                              }}
                              className="text-purple-600 hover:text-purple-800 ml-1"
                              title="Clear topic"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      {composerError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 max-w-lg mx-auto">
                          {composerError}
                        </div>
                      )}
                    </div>

                    {/* 3: Preloaded Issue Suggestions & Module Selector IMMEDIATELY ABOVE Composer */}
                    <div className="border-t border-slate-200 bg-white">
                      <div className="p-2.5 sm:px-4 bg-slate-50/70 border-b border-slate-100">
                        {!selectedCategory ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Suggested Topics
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Select a module to browse common questions
                              </span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                              {GUIDED_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleSelectCategory(cat)}
                                    className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:border-purple-300 hover:bg-purple-50/60 hover:text-purple-700 transition shadow-2xs"
                                  >
                                    <Icon size={14} className="text-purple-600 shrink-0" />
                                    <span>{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(null);
                                    setSelectedIssue("");
                                  }}
                                  className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                  <ArrowLeft size={13} />
                                  <span>All Modules</span>
                                </button>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                                  <span>{selectedCategory.label}</span>
                                </div>
                              </div>
                              {selectedIssue && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedIssue("")}
                                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                                >
                                  Clear selected
                                </button>
                              )}
                            </div>

                            {/* Issue Chips directly above input box */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                              {selectedCategory.issues.map((issue, idx) => {
                                const isSelected = selectedIssue === issue;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectIssue(selectedCategory, issue)}
                                    className={`inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition ${
                                      isSelected
                                        ? "border-purple-600 bg-purple-600 text-white font-bold shadow-xs"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                                    }`}
                                  >
                                    {isSelected && <Check size={12} />}
                                    <span>{issue}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4: Bottom Composer at the bottom */}
                      <div className="p-3 sm:p-4">
                        <form onSubmit={handleStartConversation} className="space-y-2 max-w-4xl mx-auto">
                          {/* Selected File Badge */}
                          {composerFile && (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                              <Paperclip size={13} className="text-purple-600" />
                              <span className="truncate max-w-[200px] font-medium">
                                {composerFile.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setComposerFile(null)}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          )}

                          <div className="flex items-end gap-2">
                            {/* File Upload Button */}
                            <label
                              className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-purple-600 cursor-pointer transition shadow-2xs"
                              title="Attach Screenshot or Document"
                            >
                              <Paperclip size={18} />
                              <input
                                type="file"
                                onChange={(e) => setComposerFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>

                            {/* Text input */}
                            <textarea
                              rows={1}
                              value={composerMessage}
                              onChange={(e) => setComposerMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleStartConversation(e);
                                }
                              }}
                              placeholder={
                                selectedIssue
                                  ? `Inquiry regarding "${selectedIssue}" (press Enter to send)...`
                                  : "Type your issue or question here..."
                              }
                              className="flex-1 min-h-[44px] max-h-32 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none shadow-2xs"
                            />

                            {/* Send Button */}
                            <button
                              type="submit"
                              disabled={composerLoading || (!composerMessage.trim() && !selectedIssue)}
                              className="flex h-11 min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-40"
                            >
                              {composerLoading ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : (
                                <>
                                  <Send size={15} />
                                  <span className="hidden sm:inline">Send</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
