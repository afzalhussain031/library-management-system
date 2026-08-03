import React, { createContext, useContext, useState } from 'react';
import BookDetailsModal from '../components/common/BookDetailsModal';
import PublisherDetailsModal from '../components/admin/publishers/PublisherDetailsModal';
import MemberDetailsModalWrapper from '../components/admin/members/MemberDetailsModalWrapper';

const EntityModalContext = createContext();

export const useEntityModal = () => useContext(EntityModalContext);

export const EntityModalProvider = ({ children }) => {
  const [bookId, setBookId] = useState(null);
  const [publisherId, setPublisherId] = useState(null);
  const [memberId, setMemberId] = useState(null);

  const showBook = (id) => setBookId(id);
  const showPublisher = (id) => setPublisherId(id);
  const showMember = (id) => setMemberId(id);

  return (
    <EntityModalContext.Provider value={{ showBook, showPublisher, showMember }}>
      {children}
      
      {bookId && (
        <BookDetailsModal 
          bookId={bookId} 
          onClose={() => setBookId(null)} 
        />
      )}
      
      {publisherId && (
        <PublisherDetailsModal 
          publisherId={publisherId} 
          onClose={() => setPublisherId(null)} 
        />
      )}
      
      {memberId && (
        <MemberDetailsModalWrapper 
          memberId={memberId} 
          onClose={() => setMemberId(null)} 
        />
      )}
    </EntityModalContext.Provider>
  );
};
