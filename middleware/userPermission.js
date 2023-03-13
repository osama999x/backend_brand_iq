const checkPermission = async (req, res, next) => {
  const user = req.user;
  const route = req.route.path;
  const method = req.method;
  const allowedActions = ["GET", "POST", "PUT", "DELETE"];

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized: You must be logged in to access this resource",
    });
  }

  const roleIds = user.roles;
  const roles = await Role.find({ _id: { $in: roleIds } }).populate(
    "permissions"
  );
  let hasPermission = false;

  for (const role of roles) {
    for (const permission of role.permissions) {
      if (permission.route === route && allowedActions.includes(method)) {
        hasPermission = permission.actions.includes(method);
        if (hasPermission) break;
      }
    }
    if (hasPermission) break;
  }

  if (!hasPermission) {
    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource",
    });
  }

  next();
};
