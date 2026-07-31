import React from 'react';

const LoanTimeline = ({ issuedAt, dueAt, returnedAt, className = '' }) => {
  const isReturned = !!returnedAt;
  const dueDate = new Date(dueAt);
  const now = new Date();
  
  // Calculate if the book is overdue (not returned and past due date, or returned after due date)
  const isOverdue = !isReturned && dueDate < now;
  const returnedLate = isReturned && new Date(returnedAt) > dueDate;
  
  const isCurrentlyAccruing = !isReturned && isOverdue;
  const isProblematic = returnedLate || isCurrentlyAccruing;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const widthClass = className?.includes('w-') ? '' : 'w-full min-w-[200px]';

  // --- Dynamic Node Ordering ---
  const nodes = [
    { pos: 0, label: 'Issued', date: formatDate(issuedAt), color: 'bg-green-500', labelColor: 'text-green-600', dateColor: 'text-gray-500' }
  ];

  let fillWidth = '50%';
  let fillColor = 'bg-gray-400';

  if (isReturned && !returnedLate) {
    fillWidth = '50%';
    fillColor = 'bg-gray-400';
    nodes.push({ pos: 50, label: 'Returned', date: formatDate(returnedAt), color: 'bg-gray-600', labelColor: 'text-gray-700', dateColor: 'text-gray-500' });
    nodes.push({ pos: 100, label: 'Due', date: formatDate(dueAt), color: 'bg-yellow-400 opacity-40', labelColor: 'text-yellow-600 opacity-40', dateColor: 'text-gray-400 opacity-60' });
  } else if (isReturned && returnedLate) {
    fillWidth = '100%';
    fillColor = 'bg-red-400';
    nodes.push({ pos: 50, label: 'Due', date: formatDate(dueAt), color: 'bg-yellow-400', labelColor: 'text-yellow-600', dateColor: 'text-gray-500' });
    nodes.push({ pos: 100, label: 'Returned', date: formatDate(returnedAt), color: 'bg-red-500', labelColor: 'text-red-600', dateColor: 'text-red-500' });
  } else if (!isReturned && !isOverdue) {
    fillWidth = '50%';
    fillColor = 'bg-blue-400';
    nodes.push({ pos: 50, label: 'Current', date: 'Active', color: 'bg-blue-400 animate-pulse', labelColor: 'text-blue-500', dateColor: 'text-blue-500' });
    nodes.push({ pos: 100, label: 'Due', date: formatDate(dueAt), color: 'bg-yellow-400', labelColor: 'text-yellow-600', dateColor: 'text-gray-500' });
  } else if (!isReturned && isOverdue) {
    fillWidth = '100%';
    fillColor = 'bg-red-500 animate-pulse';
    nodes.push({ pos: 50, label: 'Due', date: formatDate(dueAt), color: 'bg-yellow-400', labelColor: 'text-yellow-600', dateColor: 'text-gray-500' });
    nodes.push({ pos: 100, label: 'Overdue', date: 'Accruing', color: 'bg-red-500 animate-pulse', labelColor: 'text-red-600', dateColor: 'text-red-500' });
  }

  return (
    <div className={`flex flex-col justify-center pt-6 pb-6 ${widthClass} ${className}`}>
      <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
        {/* Progress fill */}
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${fillColor}`}
          style={{ width: fillWidth }}
        ></div>
        
        {/* Rendering Nodes */}
        {nodes.map((node, i) => {
          const isAbove = i === 0 || i === 2; // Top-Bottom-Top staggering
          
          let transform = 'translateX(-50%)';
          let dotTransform = 'translate(-50%, -50%)';
          let align = 'items-center';

          if (i === 0) {
            transform = 'translateX(0)';
            dotTransform = 'translate(0, -50%)';
            align = 'items-start';
          }
          if (i === 2) {
            transform = 'translateX(-100%)';
            dotTransform = 'translate(-100%, -50%)';
            align = 'items-end';
          }

          return (
            <React.Fragment key={i}>
              <div 
                className={`absolute top-1/2 w-2.5 h-2.5 rounded-full border-2 border-white z-10 ${node.color}`}
                style={{ left: `${node.pos}%`, transform: dotTransform }}
              ></div>
              <div 
                className={`absolute flex flex-col leading-none ${isAbove ? 'bottom-[calc(50%+10px)]' : 'top-[calc(50%+10px)]'} ${align}`}
                style={{ left: `${node.pos}%`, transform }}
              >
                <span className={`text-[9px] font-bold uppercase tracking-wider ${node.labelColor}`}>
                  {node.label}
                </span>
                <span className={`text-[10px] font-medium mt-0.5 ${node.dateColor}`}>
                  {node.date}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LoanTimeline;
