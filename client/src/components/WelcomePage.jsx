import { Link } from "react-router-dom";

export const WelcomePage = () => {
  return (
    <>
      <header className="header">
        <div>
          <img
            src="../../assets/TalentCodeLogo.png"
            alt="logo"
            className="header-logo"
          />
        </div>
        <div className="header__nav-links">
          <div className="header__admin-btn-box">
            <span className="header__admin-text">Are you an admin?</span>
            <Link to="login">
              <button type="button" className="header__btn">
                Click here to login
              </button>
            </Link>
          </div>
        </div>
      </header>
      <div className="welcome">
        <div className="welcome__secondary">
          <header className="heading mb-lg">
            <h1 className="heading__primary">
              Welcome To Talent Code Africa Assessment Platform
            </h1>
          </header>

          <section className="description mb-xlg">
            <p className="description__para mb-lg">
              Unlock the potential of every student with our comprehensive
              assessment tools. Identify strengths, address challenges, and
              foster a culture of continuous improvement.
            </p>
            <p className="description__ready mb-lg">Ready to get started?</p>
            <Link to="/student-bio-data" className="description__link">
              Proceed With Assessment
            </Link>
          </section>
        </div>
      </div>
    </>
  );
};
