import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import TypeAhead, { TypeAheadProps } from "./TypeAhead";

interface UserInvitieModalProps extends TypeAheadProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleInvite: () => void;
}

const UserInviteModal: React.FC<UserInvitieModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedUserList,
  setSelectedUserList,
  handleInvite,
}) => {
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <Modal show={isModalOpen}>
      <Modal.Header>
        <Modal.Title>Invite paticipants</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TypeAhead
          selectedUserList={selectedUserList}
          setSelectedUserList={setSelectedUserList}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleInvite}>
          Invite
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default UserInviteModal;
