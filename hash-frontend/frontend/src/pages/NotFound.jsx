import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page not-found">
      <span className="hash-mark hash-mark-lg">#</span>
      <h1>Page not found</h1>
      <p>That page doesn't exist. It may have moved, or the link is off.</p>
      <Link className="btn btn-primary" to="/">
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
