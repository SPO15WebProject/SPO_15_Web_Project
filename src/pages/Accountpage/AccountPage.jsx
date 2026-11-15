import { useState } from 'react'
import axios from "axios";
import "./AccountPage.css";

function AccountPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [nickname, setNickname] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const updateNickname = async () => {
    try {
      const response = await axios.put(
        `/api/db/UpdateNickname/${user.userid}`,
        {
          nickname
        }
      );

      const updatedUser = {
        ...user,
        nickname: response.data.nickname
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage("Nimimerkki päivitetty!");

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Nimimerkin päivitys epäonnistui."
      );
    }
  };

  const updateEmail = async () => {
    try {
      const response = await axios.put(
        `/api/db/UpdateEmail/${user.userid}`,
        {
          email,
          password: prompt("Anna nykyinen salasanasi")
        }
      );

      const updatedUser = {
        ...user,
        email: response.data.email
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage("Sähköposti päivitetty!");

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Sähköpostin päivitys epäonnistui."
      );
    }
  };

  const updatePassword = async () => {
    try {
      await axios.put(
        `/api/db/UpdatePassword/${user.userid}`,
        {
          password: currentPassword,
          newPassword
        }
      )

      setMessage("Salasana päivitetty!")

      setCurrentPassword("")
      setNewPassword("")

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Salasanan vaihto epäonnistui."
      )
    }
  }

  const deleteAccount = async () => {
    const password = prompt(
      "Anna salasanasi tilin poistamista varten."
    )

    if (!password) return

    const confirmDelete = window.confirm(
      "Haluatko varmasti poistaa käyttäjätilisi?"
    )

    if (!confirmDelete) return

    try {
      await axios.delete(
        `/api/db/DeleteUser/${user.userid}`,
        {
          data: {
            password
          }
        }
      )

      await axios.post(
        "/api/db/Logout",
        {},
        {
          withCredentials: true
        }
      )
      
      localStorage.removeItem("user")

      window.location.href = "/"

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Tilin poistaminen epäonnistui."
      )
    }
  }

  return (
    <div className="account-page">
      <div className="account-card">

        <h2>Oma tili</h2>

        <div className="user-info">
          <p>
            <strong>Nimimerkki:</strong> {user?.nickname}
          </p>

          <p>
            <strong>Sähköposti:</strong> {user?.email}
          </p>
        </div>

        <section className="account-section">
          <h2>Muuta tietoja</h2>

          <input
            className="account-input"
            type="text"
            placeholder="Uusi nimimerkki"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <button
            className="account-btn"
            onClick={updateNickname}
          >
            Vaihda nimimerkki
          </button>

          <input
            className="account-input"
            type="email"
            placeholder="Uusi sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="account-btn"
            onClick={updateEmail}
          >
            Vaihda sähköposti
          </button>

          <input
            className="account-input"
            type={showPassword ? "text" : "password"}
            placeholder="Nykyinen salasana"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            className="account-input"
            type={showPassword ? "text" : "password"}
            placeholder="Uusi salasana"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className="show-password-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Näytä salasanat
          </label>

          <button
            className="account-btn"
            onClick={updatePassword}
          >
            Vaihda salasana
          </button>

        </section>

        <section className="account-section danger-section">
          <h2></h2>

          <button
            className="delete-btn"
            onClick={deleteAccount}
          >
            Poista käyttäjätili
          </button>
        </section>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default AccountPage;