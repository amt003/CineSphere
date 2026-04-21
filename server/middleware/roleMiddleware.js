import authMiddleware from "./authMiddleware.js";

// Role-based middleware wrapper
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No user in request" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied - insufficient permissions" });
    }

    next();
  };
};

// Specific role helpers
export const requireSuperAdmin = requireRole("superadmin");
export const requireTheatreAdmin = requireRole("theatreAdmin");
export const requireCustomer = requireRole("customer");
export const requireTheatreAdminOrSuper = requireRole(
  "theatreAdmin",
  "superadmin",
);

export default requireRole;
