import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-dark text-white min-h-screen p-6">
      <div className="mt-5">
        <ul className="space-y-4">
          <li>
          <button className="btn btn-dark border-0 me-2">
            <i className="bi bi-git-pull-request"></i> Dashboard
          </button>
          </li>
          <li>
          <button className="btn btn-dark border-0 me-2">
              Projects
              </button>
          </li>
          <li>
          <button className="btn btn-dark border-0 me-2">
              Tasks
              </button>
          </li>
          <li>
          <button className="btn btn-dark border-0 me-2">
              Reports
              </button>
          </li>
          </ul> 
          </div>
          <div  className="mt-80">
            <ul className="space-y-4">
              <li>
              <button className="btn btn-dark border-0 me-2">
              Settings
              </button>
          </li>
          <button className="btn btn-dark border-0 me-2">
              Tasks
              </button>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
