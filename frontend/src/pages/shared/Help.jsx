import React, { useState } from 'react';
import { ChevronDown, Mail, Phone, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: "How long can I keep a borrowed book?",
    answer: "Standard borrowing time is 14 days for students and 30 days for staff. You can renew a book once if no one else has reserved it."
  },
  {
    question: "How do I renew a book that is about to expire?",
    answer: "Go to 'My Loans' from your dashboard. If the book is eligible for renewal, you will see a 'Renew' button next to it. Books with pending reservations cannot be renewed."
  },
  {
    question: "How much is the late fee per day?",
    answer: "The late fee is ₹10 per day per book. Fines are calculated automatically and will appear in your 'Fines & Payments' tab once a book becomes overdue."
  },
  {
    question: "What happens if I lose or damage a book?",
    answer: "Please report lost or damaged books to the librarian immediately. You will be required to pay the replacement cost of the book plus a standard processing fee."
  },
  {
    question: "How long will the library hold my reserved book once it's ready?",
    answer: "Once a reserved book is marked 'Ready', you have 48 hours to pick it up from the circulation desk. After that, it will be passed to the next person in the queue or returned to the shelf."
  }
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E2538] tracking-tight">Help & Support</h1>
        <p className="text-[#7E8B9B] text-sm mt-1">
          Find answers to common questions or contact the library staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: FAQs (Takes up 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[16px] font-bold text-[#1E2538] mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF8A00]" />
            Frequently Asked Questions
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer ${
                      isOpen ? 'bg-[#FFF9E6]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-semibold text-[14px] ${isOpen ? 'text-[#1E2538]' : 'text-[#1E2538]'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-[#7E8B9B] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF8A00]' : ''}`} 
                    />
                  </button>
                  
                  {/* Accordion Content */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-5 text-[13px] text-[#7E8B9B] bg-white border-t border-gray-50 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Guides Section */}
          <div className="mt-8">
            <h2 className="text-[16px] font-bold text-[#1E2538] mb-4">Quick Guides & Policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="#" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#F6CD46] hover:shadow-md transition-all group">
                <span className="font-semibold text-[13px] text-[#1E2538]">Code of Conduct</span>
                <ExternalLink className="w-4 h-4 text-[#7E8B9B] group-hover:text-[#FF8A00]" />
              </a>
              <a href="#" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#F6CD46] hover:shadow-md transition-all group">
                <span className="font-semibold text-[13px] text-[#1E2538]">Computer Usage Policy</span>
                <ExternalLink className="w-4 h-4 text-[#7E8B9B] group-hover:text-[#FF8A00]" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Card (Takes up 1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFBE5] rounded-[28px] p-6 border border-[#FFF7D4]/60 shadow-sm shadow-yellow-500/5 sticky top-6">
            <h3 className="text-[18px] font-bold text-[#1E2538] mb-2">Need more help?</h3>
            <p className="text-[13px] text-[#7E8B9B] mb-6">
              Our librarians are here to assist you with any questions or account issues.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-[12px] text-[#F472B6] shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#7E8B9B] uppercase tracking-wider">Email Support</p>
                  <a href="mailto:support@library.edu" className="text-[14px] font-bold text-[#1E2538] hover:text-[#FF8A00] transition-colors">
                    support@library.edu
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-[12px] text-[#FF7A00] shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#7E8B9B] uppercase tracking-wider">Phone</p>
                  <a href="tel:+918001234567" className="text-[14px] font-bold text-[#1E2538] hover:text-[#FF8A00] transition-colors">
                    +91 800 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-[12px] text-[#F6CD46] shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#7E8B9B] uppercase tracking-wider">Location & Hours</p>
                  <p className="text-[14px] font-bold text-[#1E2538]">Main Circulation Desk</p>
                  <p className="text-[13px] text-[#7E8B9B] mt-0.5">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-[13px] text-[#7E8B9B]">Saturday: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-[#FCE49F] hover:bg-[#FAD980] text-[#332500] text-[13px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm text-center">
              CONTACT LIBRARIAN
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
