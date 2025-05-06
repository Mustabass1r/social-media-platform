import React, { useState } from "react";
import { Modal, Box, Button, Typography } from "@mui/material";
import axios from "axios";

const ManageUsersModal = ({ open, onClose, users, communityId, updateUsersList }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State for confirmation modal
    const [userToRemove, setUserToRemove] = useState(null); // Store user to be removed
  
    // Function to remove a user from the community
    const removeUserFromCommunity = async (userId) => {
      try {
        const response = await axios.delete(
          "http://localhost:3000/communities/removeUserFromCommunity",
          {
            params: {
              userId: userId,
              communityId: communityId,
            },
          }
        );
        console.log(response.data);
  
        // Update the users list in the parent component
        if (response.status === 200) {
          updateUsersList(userId); // This will remove the user from the list
        }
  
        // Close the confirmation modal after successful removal
        setIsConfirmModalOpen(false);
      } catch (error) {
        console.log(error);
      }
    };
  
    // Handle user click to confirm removal
    const handleRemoveClick = (userId) => {
      setUserToRemove(userId); // Set the user to remove
      setIsConfirmModalOpen(true); // Open the confirmation modal
    };
  
    // Handle canceling removal
    const handleCancelRemove = () => {
      setUserToRemove(null); // Clear the user to be removed
      setIsConfirmModalOpen(false); // Close the confirmation modal
    };
  
    return (
      <>
        <Modal
          open={open}
          onClose={onClose}
          aria-labelledby="manage-users-modal"
          aria-describedby="modal-to-manage-users"
          sx={{ color: "var(--white)" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "white",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              backgroundColor: "var(--component-bg)",
              overflow: "hidden", // Prevent overflowing content
              maxHeight: "calc(80vh - 120px)", // Adjust the height based on title and padding
              overflowY: "auto", // Enable vertical scrolling
              scrollbarWidth: "thin", // Add a thin scrollbar
              scrollbarColor: "var(--gold) var(--component-bg)",
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontFamily: "Poppins" }}>
              Manage Users
            </Typography>
            <div style={{ marginTop: "2rem" }}>
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    style={{
                      marginBottom: "1rem",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <img
                      src={user.profilePhoto}
                      alt={user.username}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                      }}
                    />
                    <Typography sx={{ fontFamily: "Poppins" }}>
                      {user.username}
                    </Typography>
                    <Button
                      style={{
                        marginLeft: "auto",
                        fontFamily: "Poppins",
                        color: "var(--black)",
                        backgroundColor: "var(--gold)",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                      }}
                      variant="contained"
                      onClick={() => handleRemoveClick(user._id)} // Open confirmation modal
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <Typography>No users to manage.</Typography>
              )}
            </div>
          </Box>
        </Modal>
  
        {/* Confirmation Modal */}
        <Modal
          open={isConfirmModalOpen}
          onClose={handleCancelRemove}
          aria-labelledby="confirmation-modal"
          aria-describedby="modal-to-confirm-user-removal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "white",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              backgroundColor: "var(--component-bg)",
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: "Poppins" }}>
              Are you sure you want to remove this user?
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "2rem",
              }}
            >
              <Button
                variant="contained"
                onClick={handleCancelRemove} // Cancel removal
                sx={{
                  fontFamily: "Poppins",
                  backgroundColor: "var(--gold)",
                  color: "var(--black)",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => removeUserFromCommunity(userToRemove)} // Proceed with removal
                sx={{
                  fontFamily: "Poppins",
                  backgroundColor: "var(--gold)",
                  color: "var(--black)",
                }}
              >
                Remove
              </Button>
            </div>
          </Box>
        </Modal>
      </>
    );
  };
  
  export default ManageUsersModal;