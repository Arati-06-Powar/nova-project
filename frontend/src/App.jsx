import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  /* =====================================================
     AUTH STATE
     ===================================================== */

  const [isLogin, setIsLogin] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  /* =====================================================
     PROJECT STATE
     ===================================================== */

  const [projects, setProjects] = useState([]);

  const [projectData, setProjectData] = useState({
    name: "",
    description: ""
  });

  const [editingProject, setEditingProject] = useState(null);

  /* =====================================================
     TASK STATE
     ===================================================== */

  const [tasks, setTasks] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: ""
  });

  const [editingTask, setEditingTask] = useState(null);

  /* =====================================================
     MEMBER STATE
     ===================================================== */

  const [members, setMembers] = useState([]);

  const [memberEmail, setMemberEmail] = useState("");

  /* =====================================================
     UI STATE
     ===================================================== */

  const [activeSection, setActiveSection] = useState("dashboard");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        setIsLoggedIn(true);

        setLoginData({
          email: "",
          password: ""
        });

        alert("Login successful!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server connection failed");
    }
  };

  /* =====================================================
     SIGNUP
     ===================================================== */

  const handleSignup = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please login.");

        setIsLogin(true);

        e.target.reset();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server connection failed");
    }
  };

  /* =====================================================
     FETCH PROJECTS
     ===================================================== */

  const fetchProjects = async () => {
    const token = getToken();

    try {
      const response = await fetch(`${API}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch projects");
    }
  };

  /* =====================================================
     CREATE PROJECT
     ===================================================== */

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const token = getToken();

    try {
      const response = await fetch(`${API}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Project created successfully!");

        setProjectData({
          name: "",
          description: ""
        });

        fetchProjects();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to create project");
    }
  };

  /* =====================================================
     EDIT PROJECT
     ===================================================== */

  const handleEditProject = (project) => {
    setEditingProject(project);

    setProjectData({
      name: project.name,
      description: project.description || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  /* =====================================================
     UPDATE PROJECT
     ===================================================== */

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    const token = getToken();

    try {
      const response = await fetch(
        `${API}/projects/${editingProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: projectData.name,
            description: projectData.description,
            status: editingProject.status
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Project updated successfully!");

        setEditingProject(null);

        setProjectData({
          name: "",
          description: ""
        });

        fetchProjects();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to update project");
    }
  };

  /* =====================================================
     DELETE PROJECT
     ===================================================== */

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        `${API}/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Project deleted successfully!");

        if (selectedProject === projectId) {
          setSelectedProject(null);
          setTasks([]);
          setMembers([]);
        }

        fetchProjects();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete project");
    }
  };

  /* =====================================================
     OPEN PROJECT
     ===================================================== */

  const openProject = (projectId) => {
    setSelectedProject(projectId);

    loadTasks(projectId);

    loadMembers(projectId);

    setActiveSection("project");
  };

  /* =====================================================
     LOAD TASKS
     ===================================================== */

  const loadTasks = async (projectId) => {
    const token = getToken();

    try {
      const response = await fetch(
        `${API}/tasks/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch tasks");
    }
  };

  /* =====================================================
     CREATE TASK
     ===================================================== */

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      alert("Please select a project first.");
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          project_id: selectedProject
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Task created successfully!");

        setTaskData({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: ""
        });

        loadTasks(selectedProject);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to create task");
    }
  };

  /* =====================================================
     EDIT TASK
     ===================================================== */

  const handleEditTask = (task) => {
    setEditingTask(task);

    setTaskData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date
        ? String(task.due_date).substring(0, 10)
        : ""
    });
  };

  /* =====================================================
     UPDATE TASK
     ===================================================== */

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const token = getToken();

    try {
      const response = await fetch(
        `${API}/tasks/${editingTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Task updated successfully!");

        setEditingTask(null);

        setTaskData({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: ""
        });

        loadTasks(selectedProject);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to update task");
    }
  };

  /* =====================================================
     DELETE TASK
     ===================================================== */

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        `${API}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Task deleted successfully!");

        loadTasks(selectedProject);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete task");
    }
  };

  /* =====================================================
     LOAD MEMBERS
     ===================================================== */

  const loadMembers = async (projectId) => {
    const token = getToken();

    try {
      const response = await fetch(
        `${API}/members/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMembers(data.members);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch members");
    }
  };

  /* =====================================================
     ADD MEMBER
     ===================================================== */

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      alert("Please select a project first.");
      return;
    }

  if (!memberEmail) {
  alert("Enter a member email.");
  return;
}
    const token = getToken();

    try {
      const response = await fetch(`${API}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: selectedProject,
          email: memberEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Member added successfully!");

        setMemberEmail("");

        loadMembers(selectedProject);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to add member");
    }
  };

  /* =====================================================
     REMOVE MEMBER
     ===================================================== */

  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmRemove) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        `${API}/members/${selectedProject}/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Member removed successfully!");

        loadMembers(selectedProject);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to remove member");
    }
  };

  /* =====================================================
     AUTO LOAD PROJECTS
     ===================================================== */

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");

    setIsLoggedIn(false);

    setProjects([]);

    setTasks([]);

    setMembers([]);

    setSelectedProject(null);

    setEditingProject(null);

    setEditingTask(null);
  };

  /* =====================================================
     STATISTICS
     ===================================================== */

  const totalProjects = projects.length;

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  ).length;

  /* =====================================================
     LOGIN / SIGNUP UI
     ===================================================== */

  if (!isLoggedIn) {
    return (
      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-left">

          <div className="auth-brand">
            <h1>
              NOVA<span>.</span>
            </h1>
          </div>

          <h2>
            Plan better.
            <br />
            Collaborate smarter.
            <br />
            Deliver faster.
          </h2>

          <p>
            A modern project management platform designed
            to help teams organize projects, manage tasks
            and collaborate efficiently.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <div className="auth-feature-icon">
                ✓
              </div>

              <span>
                Manage projects effortlessly
              </span>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                ✓
              </div>

              <span>
                Track tasks and deadlines
              </span>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                ✓
              </div>

              <span>
                Collaborate with your team
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="auth-right">

          <div className="auth-card">

            {isLogin ? (
              <>
                <h2>
                  Welcome back
                </h2>

                <p className="auth-card-subtitle">
                  Sign in to continue to your NOVA workspace.
                </p>

                <form
                  className="auth-form"
                  onSubmit={handleLogin}
                >

                  <div>
                    <label>
                      Email address
                    </label>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          email: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <button
                    className="auth-button"
                    type="submit"
                  >
                    Sign in
                  </button>

                </form>

                <p className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                  >
                    Create account
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2>
                  Create your account
                </h2>

                <p className="auth-card-subtitle">
                  Start managing your projects with NOVA.
                </p>

                <form
                  className="auth-form"
                  onSubmit={handleSignup}
                >

                  <div>
                    <label>
                      Full name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label>
                      Email address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <button
                    className="auth-button"
                    type="submit"
                  >
                    Create account
                  </button>

                </form>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}

          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD UI
     ===================================================== */

  return (
    <div className="dashboard">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <h1>
            NOVA
          </h1>

          <p>
            Team Productivity Platform
          </p>

        </div>

        <nav className="sidebar-nav">

          <div
            className={`sidebar-item ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveSection("dashboard");
              setSelectedProject(null);
            }}
          >
            <span>▦</span>
            <span>Dashboard</span>
          </div>

          <div
            className={`sidebar-item ${
              activeSection === "projects"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveSection("projects");
            }}
          >
            <span>□</span>
            <span>Projects</span>
          </div>

          <div
            className={`sidebar-item ${
              activeSection === "project"
                ? "active"
                : ""
            }`}
            onClick={() => {
              if (selectedProject) {
                setActiveSection("project");
              } else {
                alert("Please open a project first.");
              }
            }}
          >
            <span>✓</span>
            <span>Tasks</span>
          </div>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-user-name">
              NOVA User
            </div>

            <div className="sidebar-user-email">
              Workspace Member
            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Sign out
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="topbar-title">

            <h2>
              {activeSection === "project"
                ? "Project Workspace"
                : "Workspace"}
            </h2>

            <p>
              Manage your team's work in one place
            </p>

          </div>

          <div className="topbar-actions">

            <button
              className="secondary-button"
              onClick={fetchProjects}
            >
              Refresh
            </button>

          </div>

        </header>


        {/* CONTENT */}

        <div className="content-area">

          {/* =================================================
              DASHBOARD
              ================================================= */}

          {activeSection === "dashboard" && (
            <>

              <div className="page-header">

                <div>

                  <h1>
                    Good to see you 👋
                  </h1>

                  <p>
                    Here's an overview of your workspace.
                  </p>

                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    setActiveSection("projects")
                  }
                >
                  + New Project
                </button>

              </div>


              {/* STATISTICS */}

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">
                      □
                    </div>

                  </div>

                  <div className="stat-label">
                    Total Projects
                  </div>

                  <div className="stat-number">
                    {totalProjects}
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">
                      ✓
                    </div>

                  </div>

                  <div className="stat-label">
                    Total Tasks
                  </div>

                  <div className="stat-number">
                    {totalTasks}
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">
                      ✓
                    </div>

                  </div>

                  <div className="stat-label">
                    Completed Tasks
                  </div>

                  <div className="stat-number">
                    {completedTasks}
                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">
                      !
                    </div>

                  </div>

                  <div className="stat-label">
                    Pending Tasks
                  </div>

                  <div className="stat-number">
                    {pendingTasks}
                  </div>

                </div>

              </div>


              {/* RECENT PROJECTS */}

              <section className="section">

                <div className="section-header">

                  <div>

                    <h2>
                      Recent Projects
                    </h2>

                    <p>
                      Your latest project activity
                    </p>

                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      setActiveSection("projects")
                    }
                  >
                    View all
                  </button>

                </div>


                {projects.length === 0 ? (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      □
                    </div>

                    <h3>
                      No projects yet
                    </h3>

                    <p>
                      Create your first project to get started.
                    </p>

                  </div>
                ) : (
                  <div className="project-grid">

                    {projects.slice(0, 3).map(
                      (project) => (
                        <div
                          className="project-card"
                          key={project.id}
                        >

                          <div className="project-card-top">

                            <div className="project-icon">
                              {project.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="status-badge">
                              {project.status}
                            </span>

                          </div>

                          <h3>
                            {project.name}
                          </h3>

                          <p className="project-description">
                            {project.description ||
                              "No description available."}
                          </p>

                          <div className="project-info">

                            <span>
                              Project ID: #{project.id}
                            </span>

                          </div>

                          <div className="project-actions">

                            <button
                              className="open-button"
                              onClick={() =>
                                openProject(project.id)
                              }
                            >
                              Open project
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </section>

            </>
          )}


          {/* =================================================
              PROJECTS PAGE
              ================================================= */}

          {activeSection === "projects" && (
            <>

              <div className="page-header">

                <div>

                  <h1>
                    Projects
                  </h1>

                  <p>
                    Create and manage your team's projects.
                  </p>

                </div>

              </div>


              {/* PROJECT FORM */}

              <section className="section">

                <div className="section-header">

                  <div>

                    <h2>
                      {editingProject
                        ? "Edit Project"
                        : "Create New Project"}
                    </h2>

                    <p>
                      {editingProject
                        ? "Update project information."
                        : "Start a new workspace for your team."}
                    </p>

                  </div>

                </div>


                <div className="form-card">

                  <form
                    onSubmit={
                      editingProject
                        ? handleUpdateProject
                        : handleCreateProject
                    }
                  >

                    <div className="form-group">

                      <label>
                        Project name
                      </label>

                      <input
                        type="text"
                        placeholder="Enter project name"
                        value={projectData.name}
                        onChange={(e) =>
                          setProjectData({
                            ...projectData,
                            name: e.target.value
                          })
                        }
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Description
                      </label>

                      <textarea
                        placeholder="Describe your project..."
                        value={projectData.description}
                        onChange={(e) =>
                          setProjectData({
                            ...projectData,
                            description: e.target.value
                          })
                        }
                      />

                    </div>


                    <div className="project-actions">

                      <button
                        type="submit"
                        className="primary-button"
                      >
                        {editingProject
                          ? "Update project"
                          : "Create project"}
                      </button>

                      {editingProject && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingProject(null);

                            setProjectData({
                              name: "",
                              description: ""
                            });
                          }}
                        >
                          Cancel
                        </button>
                      )}

                    </div>

                  </form>

                </div>


                {/* PROJECT LIST */}

                <div className="section-header">

                  <div>

                    <h2>
                      All Projects
                    </h2>

                    <p>
                      {projects.length} project
                      {projects.length !== 1
                        ? "s"
                        : ""}{" "}
                      in your workspace
                    </p>

                  </div>

                </div>


                {projects.length === 0 ? (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      □
                    </div>

                    <h3>
                      No projects found
                    </h3>

                    <p>
                      Create your first project above.
                    </p>

                  </div>
                ) : (
                  <div className="project-grid">

                    {projects.map((project) => (
                      <div
                        className="project-card"
                        key={project.id}
                      >

                        <div className="project-card-top">

                          <div className="project-icon">
                            {project.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="status-badge">
                            {project.status}
                          </span>

                        </div>


                        <h3>
                          {project.name}
                        </h3>


                        <p className="project-description">
                          {project.description ||
                            "No description available."}
                        </p>


                        <div className="project-info">

                          <span>
                            Project ID: #{project.id}
                          </span>

                          <span>
                            Owner: You
                          </span>

                        </div>


                        <div className="project-actions">

                          <button
                            className="open-button"
                            onClick={() =>
                              openProject(project.id)
                            }
                          >
                            Open
                          </button>

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEditProject(project)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              handleDeleteProject(
                                project.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </section>

            </>
          )}


          {/* =================================================
              PROJECT WORKSPACE
              ================================================= */}

          {activeSection === "project" &&
            selectedProject !== null && (
              <>

                <div className="page-header">

                  <div>

                    <h1>
                      Project Workspace
                    </h1>

                    <p>
                      Project ID #{selectedProject}
                    </p>

                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setActiveSection("projects");
                      setSelectedProject(null);
                    }}
                  >
                    ← Back to Projects
                  </button>

                </div>


                {/* TASK SECTION */}

                <section className="section">

                  <div className="section-header">

                    <div>

                      <h2>
                        Tasks
                      </h2>

                      <p>
                        Manage project tasks and track progress.
                      </p>

                    </div>

                    <span>
                      {tasks.length} task
                      {tasks.length !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>


                  {/* TASK FORM */}

                  <div className="form-card">

                    <h3>
                      {editingTask
                        ? "Edit Task"
                        : "Create New Task"}
                    </h3>

                    <form
                      onSubmit={
                        editingTask
                          ? handleUpdateTask
                          : handleCreateTask
                      }
                    >

                      <div className="form-grid">

                        <div className="form-group">

                          <label>
                            Task title
                          </label>

                          <input
                            type="text"
                            placeholder="Enter task title"
                            value={taskData.title}
                            onChange={(e) =>
                              setTaskData({
                                ...taskData,
                                title: e.target.value
                              })
                            }
                            required
                          />

                        </div>


                        <div className="form-group">

                          <label>
                            Due date
                          </label>

                          <input
                            type="date"
                            value={taskData.due_date}
                            onChange={(e) =>
                              setTaskData({
                                ...taskData,
                                due_date:
                                  e.target.value
                              })
                            }
                          />

                        </div>


                        <div className="form-group">

                          <label>
                            Status
                          </label>

                          <select
                            value={taskData.status}
                            onChange={(e) =>
                              setTaskData({
                                ...taskData,
                                status: e.target.value
                              })
                            }
                          >

                            <option value="todo">
                              To Do
                            </option>

                            <option value="in-progress">
                              In Progress
                            </option>

                            <option value="completed">
                              Completed
                            </option>

                          </select>

                        </div>


                        <div className="form-group">

                          <label>
                            Priority
                          </label>

                          <select
                            value={taskData.priority}
                            onChange={(e) =>
                              setTaskData({
                                ...taskData,
                                priority:
                                  e.target.value
                              })
                            }
                          >

                            <option value="low">
                              Low
                            </option>

                            <option value="medium">
                              Medium
                            </option>

                            <option value="high">
                              High
                            </option>

                          </select>

                        </div>


                        <div className="form-group full">

                          <label>
                            Description
                          </label>

                          <textarea
                            placeholder="Describe the task..."
                            value={
                              taskData.description
                            }
                            onChange={(e) =>
                              setTaskData({
                                ...taskData,
                                description:
                                  e.target.value
                              })
                            }
                          />

                        </div>

                      </div>


                      <div className="project-actions">

                        <button
                          type="submit"
                          className="primary-button"
                        >
                          {editingTask
                            ? "Update task"
                            : "Create task"}
                        </button>


                        {editingTask && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                              setEditingTask(null);

                              setTaskData({
                                title: "",
                                description: "",
                                status: "todo",
                                priority: "medium",
                                due_date: ""
                              });
                            }}
                          >
                            Cancel
                          </button>
                        )}

                      </div>

                    </form>

                  </div>


                  {/* TASK LIST */}

                  {tasks.length === 0 ? (
                    <div className="empty-state">

                      <div className="empty-state-icon">
                        ✓
                      </div>

                      <h3>
                        No tasks yet
                      </h3>

                      <p>
                        Create a task to start tracking project work.
                      </p>

                    </div>
                  ) : (
                    <div className="task-list">

                      {tasks.map((task) => (

                        <div
                          className="task-card"
                          key={task.id}
                        >

                          <div className="task-top">

                            <div>

                              <h4>
                                {task.title}
                              </h4>

                              <p className="task-description">
                                {task.description ||
                                  "No description available."}
                              </p>

                            </div>

                            <span
                              className={`status-badge ${
                                task.status ===
                                "completed"
                                  ? "status-completed"
                                  : task.status ===
                                    "in-progress"
                                  ? "status-progress"
                                  : "status-todo"
                              }`}
                            >
                              {task.status}
                            </span>

                          </div>


                          <div className="task-meta">

                            <span
                              className={
                                task.priority ===
                                "high"
                                  ? "priority-high"
                                  : task.priority ===
                                    "medium"
                                  ? "priority-medium"
                                  : "priority-low"
                              }
                            >
                              Priority:{" "}
                              {task.priority}
                            </span>

                            <span>
                              Due:{" "}
                              {task.due_date
                                ? String(
                                    task.due_date
                                  ).substring(0, 10)
                                : "Not set"}
                            </span>

                            <span>
                              Task #{task.id}
                            </span>

                          </div>


                          <div className="task-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEditTask(task)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="danger-button"
                              onClick={() =>
                                handleDeleteTask(
                                  task.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      ))}

                    </div>
                  )}

                </section>


                {/* =================================================
                    TEAM MEMBERS
                    ================================================= */}

                <section className="section">

                  <div className="section-header">

                    <div>

                      <h2>
                        Team Members
                      </h2>

                      <p>
                        Manage people working on this project.
                      </p>

                    </div>

                    <span>
                      {members.length} member
                      {members.length !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>


                  <div className="member-form">

                    <input
  type="email"
  placeholder="Enter member email"
  value={memberEmail}
  onChange={(e) =>
    setMemberEmail(e.target.value)
  }
/>

                    <button
                      className="primary-button"
                      onClick={handleAddMember}
                    >
                      + Add member
                    </button>

                  </div>


                  {members.length === 0 ? (
                    <div className="empty-state">

                      <div className="empty-state-icon">
                        👥
                      </div>

                      <h3>
                        No team members
                      </h3>

                      <p>
                        Add members using their email address.
                      </p>

                    </div>
                  ) : (
                    <div className="member-list">

                      {members.map((member) => (

                        <div
                          className="member-card"
                          key={member.id}
                        >

                          <div className="member-info">

                            <div className="member-avatar">
                              {member.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <h4>
                                {member.name}
                              </h4>

                              <p>
                                {member.email}
                              </p>

                            </div>

                          </div>


                          <button
                            className="danger-button"
                            onClick={() =>
                              handleRemoveMember(
                                member.id
                              )
                            }
                          >
                            Remove
                          </button>

                        </div>

                      ))}

                    </div>
                  )}

                </section>

              </>
            )}

        </div>

      </main>

    </div>
  );
}

export default App;