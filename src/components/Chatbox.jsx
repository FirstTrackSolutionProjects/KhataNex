import { useEffect, useRef, useState } from "react";
import {
  X,
  Send,
  Star,
  Copy,
  Check,
} from "lucide-react";

const BOT_DELAY = 500;
const TYPING_DELAY = 800;

/* =====================================================
   KHATANEX SUPPORT OPTIONS
===================================================== */

const OPTIONS = {
  "Khata Support": {
    icon: "📖",
    options: [
      "Add new Khata entry",
      "Edit Khata entry",
      "Delete Khata entry",
      "Balance is incorrect",
    ],
    replies: {
      "Add new Khata entry":
        "To add a new Khata entry, open Khata and select the customer. Then choose Credit or Debit and enter the amount.",

      "Edit Khata entry":
        "Open the customer's Khata, find the transaction and select the edit option to update the entry.",

      "Delete Khata entry":
        "Open the transaction from the customer's Khata and use the delete option. Please verify the transaction before deleting it.",

      "Balance is incorrect":
        "Please check the customer's recent Credit and Debit entries. If the balance is still incorrect, you can raise a support ticket.",
    },
  },

  "Customer Management": {
    icon: "👥",
    options: [
      "Add customer",
      "Edit customer",
      "Delete customer",
      "Customer details",
    ],
    replies: {
      "Add customer":
        "Go to Customers and click Add Customer. Enter the customer's name, phone number and other required details.",

      "Edit customer":
        "Open the customer profile from the Customers section and select Edit Customer.",

      "Delete customer":
        "Open the customer profile and use the delete option. Please make sure you no longer need the customer's records.",

      "Customer details":
        "You can view customer balance, transactions, contact details and Khata history from the customer profile.",
    },
  },

  "Payment Support": {
    icon: "💳",
    options: [
      "Record a payment",
      "Payment not showing",
      "Payment amount incorrect",
      "Payment history",
    ],
    replies: {
      "Record a payment":
        "Open the customer's Khata and select Add Payment. Enter the payment amount and save the transaction.",

      "Payment not showing":
        "Please refresh the page and check the customer's transaction history. If the payment is still missing, raise a support ticket.",

      "Payment amount incorrect":
        "Please verify the payment entry and transaction amount. You can edit the transaction if you have permission.",

      "Payment history":
        "You can view all recorded payments from the Payments section and from the individual customer's Khata.",
    },
  },

  "Invoice Support": {
    icon: "🧾",
    options: [
      "Create invoice",
      "Invoice not showing",
      "Edit invoice",
      "Download invoice",
    ],
    replies: {
      "Create invoice":
        "Go to Invoices and select Create Invoice. Add customer, products or services, quantity and amount, then save the invoice.",

      "Invoice not showing":
        "Please check the Invoices section and refresh the page. Make sure the invoice was successfully saved.",

      "Edit invoice":
        "Open the invoice from the Invoices section and select Edit to update the required information.",

      "Download invoice":
        "Open the required invoice and use the Download option to save a copy of the invoice.",
    },
  },

  "Reports & Business": {
    icon: "📊",
    options: [
      "View business report",
      "Customer report",
      "Payment report",
      "Khata report",
    ],
    replies: {
      "View business report":
        "Open Reports from the dashboard menu to view your business performance and transaction information.",

      "Customer report":
        "The Reports section can be used to review customer-related transaction and balance information.",

      "Payment report":
        "Open Reports to review payment activity and transaction summaries.",

      "Khata report":
        "You can review customer Khata transactions and outstanding balances from the Reports section.",
    },
  },

  "Account & Settings": {
    icon: "⚙️",
    options: [
      "Update profile",
      "Change account settings",
      "Notification settings",
      "Login problem",
    ],
    replies: {
      "Update profile":
        "Open Profile from your account menu to update your personal and business information.",

      "Change account settings":
        "Open Settings to manage your KHATANEX account preferences.",

      "Notification settings":
        "You can manage your notification preferences from the Settings section.",

      "Login problem":
        "Please check your email and password. If you still cannot log in, use the password recovery option or contact support.",
    },
  },
};

/* =====================================================
   MAIN CATEGORIES
===================================================== */

const MAIN_CATEGORIES = [
  ...Object.keys(OPTIONS).map((key) => ({
    label: key,
    icon: OPTIONS[key].icon,
  })),

  {
    label: "Other",
    icon: "💬",
  },
];

/* =====================================================
   TYPING INDICATOR
===================================================== */

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-black text-white">
        K
      </div>

      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">

        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            style={{
              animation: `bounce 1.2s ease-in-out ${
                i * 0.2
              }s infinite`,
            }}
          />
        ))}

      </div>
    </div>
  );
}

/* =====================================================
   STAR RATING
===================================================== */

function StarRating({ onRate }) {

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="mt-1 flex flex-col gap-2">

      <p className="text-xs text-gray-300">
        Rate your KHATANEX support experience:
      </p>

      <div className="flex gap-1">

        {[1, 2, 3, 4, 5].map((star) => (

          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => {
              setSelected(star);
              onRate(star);
            }}
            className="transition-transform hover:scale-125"
          >

            <Star
              size={23}
              className={
                star <= (hovered || selected)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-500"
              }
            />

          </button>

        ))}

      </div>
    </div>
  );
}

/* =====================================================
   KHATANEX CHATBOX
===================================================== */

export default function Chatbox() {

  const bottomRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([]);

  const [currentOptions, setCurrentOptions] =
    useState([]);

  const [step, setStep] = useState("WELCOME");

  const [currentCategory, setCurrentCategory] =
    useState("");

  const [showInput, setShowInput] =
    useState(false);

  const [inputText, setInputText] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [showRating, setShowRating] =
    useState(false);

  const [rated, setRated] =
    useState(false);

  const [showTicketForm, setShowTicketForm] =
    useState(false);

  const [transactionId, setTransactionId] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /* =====================================================
     SUPPORT TICKET REFERENCE
  ===================================================== */

  const TICKET_REF =
    "KX-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

  /* =====================================================
     SCROLL
  ===================================================== */

  const scrollToBottom = () => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping]);

  /* =====================================================
     BOT MESSAGE
  ===================================================== */

  const addBot = (text, extra = {}) => {

    setIsTyping(false);

    setMessages((previous) => [
      ...previous,
      {
        from: "bot",
        text,
        ...extra,
      },
    ]);

  };

  /* =====================================================
     USER MESSAGE
  ===================================================== */

  const addUser = (text) => {

    setMessages((previous) => [
      ...previous,
      {
        from: "user",
        text,
      },
    ]);

  };

  /* =====================================================
     BOT SAY
  ===================================================== */

  const botSay = (
    text,
    delay = BOT_DELAY,
    extra = {}
  ) => {

    setTimeout(() => {

      setIsTyping(true);

      setTimeout(() => {

        addBot(text, extra);

      }, TYPING_DELAY);

    }, delay);

  };

  /* =====================================================
     INITIAL CHAT
  ===================================================== */

  useEffect(() => {

    if (open && messages.length === 0) {

      initChat();

    }

  }, [open]);

  const initChat = () => {

    botSay(
      "👋 Welcome to KHATANEX Support.",
      300
    );

    setTimeout(() => {

      botSay(
        "How can we help you with your business today?"
      );

      setTimeout(() => {

        setCurrentOptions(MAIN_CATEGORIES);

        setStep("MAIN");

      }, 1700);

    }, 0);
  };

  /* =====================================================
     OPTION HANDLER
  ===================================================== */

  const handleOption = (option) => {

    const label =
      typeof option === "string"
        ? option
        : option.label;

    addUser(label);

    setCurrentOptions([]);

    setShowInput(false);

    /* MAIN CATEGORY */

    if (step === "MAIN") {

      if (label === "Other") {

        botSay(
          "Please describe your KHATANEX issue."
        );

        setTimeout(() => {

          setShowInput(true);

        }, 1300);

      } else {

        setCurrentCategory(label);

        botSay(
          `Please choose a specific issue from "${label}".`
        );

        setTimeout(() => {

          setCurrentOptions(
            OPTIONS[label].options
          );

          setStep("SUB");

        }, 1300);

      }

    }

    /* SUB CATEGORY */

    else if (step === "SUB") {

      botSay(
        OPTIONS[currentCategory].replies[label]
      );

      setTimeout(() => {

        askSolved();

      }, 1700);

    }

    /* SOLVED */

    else if (step === "SOLVED") {

      handleSolved(label);

    }
  };

  /* =====================================================
     ASK RESOLVED
  ===================================================== */

  const askSolved = () => {

    botSay(
      "Was your issue resolved?",
      0
    );

    setTimeout(() => {

      setCurrentOptions([
        "✅ Yes",
        "❌ No",
      ]);

      setStep("SOLVED");

    }, 1300);

  };

  /* =====================================================
     HANDLE SOLVED
  ===================================================== */

  const handleSolved = (answer) => {

    if (answer === "✅ Yes") {

      botSay(
        "Thank you for using KHATANEX Support. ❤️"
      );

      setTimeout(() => {

        setShowRating(true);

      }, 1100);

    } else {

      botSay(
        "No problem. Please create a support ticket so our team can assist you."
      );

      setTimeout(() => {

        setShowTicketForm(true);

      }, 1400);

    }
  };

  /* =====================================================
     SUBMIT TICKET
  ===================================================== */

  const submitTicket = () => {

    if (!transactionId.trim()) return;

    addUser(
      `Transaction / Customer ID: ${transactionId}`
    );

    setShowTicketForm(false);

    botSay(
      "✅ Support ticket generated successfully.",
      0,
      {
        ticketRef: TICKET_REF,
      }
    );

  };

  /* =====================================================
     FREE TEXT
  ===================================================== */

  const submitFreeText = () => {

    if (!inputText.trim()) return;

    addUser(inputText);

    setInputText("");

    setShowInput(false);

    botSay(
      "Thank you for contacting KHATANEX. Our support team will review your issue and assist you soon."
    );

  };

  /* =====================================================
     COPY TICKET
  ===================================================== */

  const copyTicket = () => {

    navigator.clipboard.writeText(TICKET_REF);

    setCopied(true);

    setTimeout(() => {

      setCopied(false);

    }, 2000);

  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <style>{`

        @keyframes bounce {

          0%, 60%, 100% {
            transform: translateY(0);
          }

          30% {
            transform: translateY(-6px);
          }

        }

      `}</style>

      {/* =================================================
          CHAT BUTTON
      ================================================= */}

<div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">

        {!open && (

          <button
            onClick={() => setOpen(true)}
            aria-label="Open KHATANEX Support"
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-gradient-to-r
              from-emerald-600
              to-teal-500
              text-2xl text-white
              shadow-2xl
              transition-all
              duration-300
              hover:scale-110
              hover:shadow-emerald-500/30
            "
          >
            💬
          </button>

        )}

        {/* =================================================
            CHAT WINDOW
        ================================================= */}

        {open && (

<div 
className="
  fixed
  bottom-6
  right-6
  z-[9999]
  flex
  h-[500px]
  w-[360px]
  max-w-[calc(100vw-2rem)]
  flex-col
  overflow-hidden
  rounded-2xl
  border
  border-white/10
  bg-gradient-to-b
  from-[#0f172a]
  via-[#111827]
  to-[#064e3b]
  shadow-[0_20px_80px_rgba(0,0,0,0.6)]
  backdrop-blur-xl
"
>

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-gradient-to-r
                from-emerald-700
                via-emerald-600
                to-teal-500
                px-4
                py-3
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-white
                    font-extrabold
                    text-emerald-700
                    shadow
                  "
                >
                  K
                </div>

                <div>

                  <h2 className="font-extrabold tracking-wide text-white">
                    KHATANEX Assistant
                  </h2>

                  <p className="text-xs text-emerald-100">
                    ● Online
                  </p>

                </div>

              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="
                  text-white
                  transition-all
                  hover:rotate-90
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-4
                scrollbar-thin
                scrollbar-thumb-emerald-600
              "
            >

              <div className="flex flex-col gap-3">

                {messages.map((message, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      message.from === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {message.from === "bot" && (

                      <div
                        className="
                          mr-2
                          flex h-7 w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-emerald-500
                          to-teal-600
                          text-xs
                          font-bold
                          text-white
                        "
                      >
                        K
                      </div>

                    )}

                    <div
                      className={`
                        max-w-[80%]
                        rounded-2xl
                        px-4
                        py-2
                        text-sm

                        ${
                          message.from === "user"
                            ? `
                              rounded-br-sm
                              bg-gradient-to-r
                              from-emerald-600
                              to-teal-500
                              text-white
                            `
                            : `
                              rounded-bl-sm
                              border
                              border-white/10
                              bg-white/10
                              text-white
                              backdrop-blur-md
                            `
                        }
                      `}
                    >

                      {message.text}

                      {/* Ticket */}
                      {message.ticketRef && (

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <span className="text-xs font-bold text-emerald-300">
                            {message.ticketRef}
                          </span>

                          <button
                            onClick={copyTicket}
                            className="text-white"
                            aria-label="Copy ticket"
                          >

                            {copied ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}

                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                ))}

                {/* Typing */}

                {isTyping && (
                  <TypingIndicator />
                )}

                {/* =================================================
                    OPTIONS
                ================================================= */}

                {currentOptions.length > 0 &&
                  !isTyping && (

                    <div className="flex flex-col gap-2">

                      {currentOptions.map(
                        (option, index) => {

                          const label =
                            typeof option ===
                            "string"
                              ? option
                              : option.label;

                          const icon =
                            typeof option ===
                            "object"
                              ? option.icon
                              : "";

                          return (

                            <button
                              key={index}
                              onClick={() =>
                                handleOption(option)
                              }
                              className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/10
                                bg-white/10
                                px-3
                                py-3
                                text-left
                                text-sm
                                text-white
                                backdrop-blur-md
                                transition-all
                                hover:border-emerald-400/30
                                hover:bg-emerald-500/20
                              "
                            >

                              <span>
                                {icon}
                              </span>

                              {label}

                            </button>

                          );
                        }
                      )}

                    </div>

                  )}

                {/* =================================================
                    FREE TEXT
                ================================================= */}

                {showInput && (

                  <div className="flex gap-2">

                    <input
                      value={inputText}
                      onChange={(event) =>
                        setInputText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          submitFreeText();
                        }
                      }}
                      placeholder="Describe your issue..."
                      className="
                        min-w-0
                        flex-1
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-3
                        py-2
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-gray-400
                        focus:border-emerald-400
                      "
                    />

                    <button
                      onClick={submitFreeText}
                      className="
                        rounded-xl
                        bg-gradient-to-r
                        from-emerald-600
                        to-teal-500
                        px-4
                        text-white
                      "
                    >
                      <Send size={16} />
                    </button>

                  </div>

                )}

                {/* =================================================
                    SUPPORT TICKET
                ================================================= */}

                {showTicketForm && (

                  <div
                    className="
                      flex
                      flex-col
                      gap-2
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/10
                      p-3
                      backdrop-blur-md
                    "
                  >

                    <p className="text-xs text-gray-300">
                      Enter your Customer or Transaction ID:
                    </p>

                    <input
                      value={transactionId}
                      onChange={(event) =>
                        setTransactionId(
                          event.target.value
                        )
                      }
                      placeholder="Customer / Transaction ID"
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-3
                        py-2
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-gray-400
                      "
                    />

                    <button
                      onClick={submitTicket}
                      className="
                        rounded-xl
                        bg-gradient-to-r
                        from-emerald-600
                        to-teal-500
                        py-2
                        font-semibold
                        text-white
                      "
                    >
                      Submit Ticket
                    </button>

                  </div>

                )}

                {/* =================================================
                    RATING
                ================================================= */}

                {showRating && !rated && (

                  <div
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/10
                      p-3
                      backdrop-blur-md
                    "
                  >

                    <StarRating
                      onRate={(rating) => {

                        setRated(true);

                        addUser(
                          `${"⭐".repeat(rating)}`
                        );

                        botSay(
                          "Thank you for your feedback! ❤️"
                        );

                      }}
                    />

                  </div>

                )}

                <div ref={bottomRef} />

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                border-t
                border-white/10
                p-2
                text-center
                text-[11px]
                text-gray-300
              "
            >
              Powered by{" "}
              <span className="font-semibold text-emerald-300">
                KHATANEX AI Assistant
              </span>
            </div>

          </div>

        )}

      </div>
    </>
  );
}


