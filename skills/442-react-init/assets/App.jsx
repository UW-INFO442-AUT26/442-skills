const projectName = "PROJECT_NAME";

const links = [
  {
    label: "UW Canvas",
    href: "https://canvas.uw.edu",
    note: "Assignments, grades, and course materials.",
    primary: true,
  },
  {
    label: "442-skills",
    href: "https://github.com/UW-INFO442-AUT26/442-skills",
    note: "The skills your agent uses for this course.",
  },
];

export default function App() {
  return (
    <div className="page">
      <header className="site-header">
        <span className="badge">INFO 442</span>
        <h1 className="site-title">{projectName}</h1>
      </header>

      <p className="lead">
        Welcome to your new INFO 442 project. The course brand is already
        wired up through the shared tokens, and the links below take you
        to the places this course lives.
      </p>

      <ul className="link-list">
        {links.map((link) => (
          <li
            key={link.href}
            className={link.primary ? "card card--primary" : "card"}
          >
            <a className="card-link" href={link.href}>
              <span className="card-label">{link.label}</span>
              <span className="card-note">{link.note}</span>
            </a>
          </li>
        ))}

        {/* Placeholder: replace "#" with the real course site URL. */}
        <li className="card">
          <a className="card-link" href="#" data-placeholder="course-site URL">
            <span className="card-label">Course site</span>
            <span className="card-note">
              Add the course site URL here when it is ready.
            </span>
          </a>
        </li>
      </ul>
    </div>
  );
}
