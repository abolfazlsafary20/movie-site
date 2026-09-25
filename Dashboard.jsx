import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {

  const location = useLocation();

  const getTabFromUrl = () =>
    new URLSearchParams(location.search).get("tab") || "profile";


  const [tab, setTab] = useState(getTabFromUrl());


  useEffect(() => {
    setTab(getTabFromUrl());
  }, [location]);


  const [notifications, setNotifications] = useState(true);



  return (
    <div className="dashboard">

      <div className="dashboard-content">


        {tab === "profile" && (

          <div className="dashboard-box">


            {/* PROFILE HEADER */}

            <div className="profile-header">

              <div className="avatar">
                AS
              </div>


              <div className="profile-info">

                <h2>Abolfazl</h2>

                <p>@abolfazl</p>

                <span className="member-badge">
                  Member
                </span>

              </div>

            </div>




            {/* ACCOUNT INFORMATION */}

            <div className="profile-section">

              <div className="section-header">
                <h2>📌 Account Information</h2>

                <button className="edit-btn">
                  Edit
                </button>
              </div>


              <div className="settings-box">


                <div className="setting-row">
                  <span>👤 Username</span>
                  <strong>@abolfazl</strong>
                </div>


                <div className="setting-row">
                  <span>📧 Email</span>
                  <strong>
                    abolfazl@email.com
                  </strong>
                </div>


                <div className="setting-row">

                  <span>
                    🎂 Date of Birth
                  </span>

                  <input
                    type="date"
                    defaultValue="2006-06-26"
                  />

                </div>



                <div className="setting-row">

                  <span>
                    📅 Joined
                  </span>

                  <strong>
                    July 2026
                  </strong>

                </div>



                <div className="setting-row">

                  <span>
                    🌍 Country
                  </span>


                  <select>

                    <option>Iran</option>
                    <option>Germany</option>
                    <option>USA</option>

                  </select>

                </div>


              </div>


            </div>





            {/* PREFERENCES */}

            <div className="profile-section">


              <div className="section-header">

                <h2>
                  ⚙️ Preferences
                </h2>


              </div>




              <div className="settings-box">



                <div className="setting-row">

                  <span>
                    🌐 Language
                  </span>


                  <select>

                    <option>English</option>
                    <option>German</option>
                    <option>Persian</option>

                  </select>


                </div>






                <div className="setting-row">

                  <span>
                    🎥 Default Quality
                  </span>


                  <select>

                    <option>Auto</option>
                    <option>1080p</option>
                    <option>4K</option>


                  </select>


                </div>






                <div className="setting-row">


                  <span>
                    🔔 Notifications
                  </span>



                  <button
                    className={`toggle-btn ${notifications ? "active" : ""}`}
                    onClick={() => setNotifications(!notifications)}
                  >

                    {notifications ? "ON" : "OFF"}

                  </button>



                </div>



              </div>


            </div>





            {/* ACTIVITY */}


            <div className="profile-section">


              <div className="section-header">

                <h2>📊 Activity</h2>

              </div>



              <div className="profile-stats">


                <div className="stat-card">

                  <h3>42</h3>

                  <p>
                    Movies Watched
                  </p>

                </div>



                <div className="stat-card">

                  <h3>85h</h3>

                  <p>
                    Watch Time
                  </p>

                </div>



                <div className="stat-card">

                  <h3>12</h3>

                  <p>
                    Comments
                  </p>

                </div>



                <div className="stat-card">

                  <h3>5</h3>

                  <p>
                    Reviews
                  </p>

                </div>


              </div>


            </div>








            {/* CONTINUE WATCHING */}


            <div className="profile-section">


              <div className="section-header">

                <h2>🎬 Continue Watching</h2>

              </div>



              <div className="history-item">


                <img src="https://via.placeholder.com/100x150" />



                <div className="history-info">


                  <h3>
                    Spider-Man
                  </h3>


                  <div className="progress-bar">

                    <div style={{ width: "60%" }}></div>

                  </div>


                  <span>
                    60% watched
                  </span>


                </div>


              </div>


            </div>







            {/* MY LIST */}


            <div className="profile-section">


              <div className="section-header">

                <h2>❤️ My List</h2>

                <span>
                  View All
                </span>

              </div>




              <div className="grid">


                <div className="movie-card-mini">

                  <img src="https://via.placeholder.com/200x300" />

                  <p>
                    Interstellar
                  </p>

                </div>



                <div className="movie-card-mini">

                  <img src="https://via.placeholder.com/200x300" />

                  <p>
                    Batman
                  </p>

                </div>



                <div className="movie-card-mini">

                  <img src="https://via.placeholder.com/200x300" />

                  <p>
                    Joker
                  </p>

                </div>


              </div>


            </div>







            {/* RECENT WATCHED */}


            <div className="profile-section">


              <div className="section-header">

                <h2>🕒 Recently Watched</h2>

              </div>



              <div className="recent-list">

                <p>Spider-Man</p>

                <p>Interstellar</p>

                <p>Batman</p>


              </div>


            </div>



          </div>

        )}

      </div>

    </div>
  );
}