import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    return (
        <div className="profile-page">
            <div className="profile-card">

                <h2>Profiili</h2>

                <section className="profile-section">
                    <h3>Tilin tiedot</h3>

                    <div className="profile-info">
                        <p>
                            <strong>Nimimerkki:</strong>{" "}
                            {user?.nickname}
                        </p>

                        <p>
                            <strong>Sähköposti:</strong>{" "}
                            {user?.email}
                        </p>
                    </div>
                </section>

                <section className="profile-section">
                    <h3>Oma sisältö</h3>

                    <div className="profile-actions">
                        <button
                            className="profile-action-btn"
                            onClick={() => navigate("/profile/reviews")}
                        >
                            Omat arvostelut
                        </button>

                        <button
                            className="profile-action-btn"
                            onClick={() => navigate("/profile/groups")}
                        >
                            Omat ryhmät
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default ProfilePage;