import React, { useState } from "react";
import Category from "./Category.jsx";
import CreateCommunity from "./CreateCommunity.jsx";
import "./ExploreCommunities.css";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { Modal, Box } from "@mui/material";
import { useEffect } from "react";
import axios from "axios";

function ExploreCommunities() {

  useEffect(() => {
    fetchExploredCommunities();
  }, []);

  const [userCategories, setUserCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const fetchExploredCommunities = async () => {
    try {
      const response = await axios(
        "http://localhost:3000/communities/explore",
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
          },
        }
      );
      const data = response.data;
      setUserCategories(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  return (
    <>
      <div className="explore-communities">
        <div className="create-community-btn">
          <Fab
            color="var(--gold)"
            aria-label="add"
            sx={{
              backgroundColor: "var(--gold)",
              width: "110%",
              borderRadius: "0.5rem",
              height: "2.5rem",
              padding: "0.5rem",
              "&:hover": { backgroundColor: "var(--white)" },
            }}
            onClick={handleOpenModal}
          >
            <AddIcon />
            <h4 style={{ alignSelf: "center", marginLeft: "0.5rem" }}>
              Create Community
            </h4>
          </Fab>
        </div>
        {userCategories.map((categoryData) => (
        <Category key={categoryData.category} category={categoryData.category} communities={categoryData.communities} />
      ))}
      </div>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-community-modal"
        aria-describedby="modal-to-create-new-community"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: 500,
            bgcolor: "var(--component-bg)",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <CreateCommunity onClose={handleCloseModal} />
        </Box>
      </Modal>
    </>
  );
}

export default ExploreCommunities;
