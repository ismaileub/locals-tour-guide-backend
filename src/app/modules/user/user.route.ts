import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { fileUploader } from "../../helpers/fileUploader";

const router = Router();

router.post(
  "/register",

  UserControllers.createUser
);
router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers);
router.delete("/:id", checkAuth(Role.ADMIN), UserControllers.deleteUser);

router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get("/get-all-guide", UserControllers.getAllGuides);

router.get("/:id", UserControllers.getUserById);

// router.patch(
//   "/:updateMe",
//   checkAuth(...Object.values(Role)), // Only authenticated users
//   fileUploader.upload.single("file"), // Handle file upload
//   (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // If frontend sends JSON inside "data"
//       if (req.body.data) {
//         req.body = JSON.parse(req.body.data);
//       }
//       return UserControllers.updateUser(req, res, next);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

router.patch(
  "/:updateMe",
  checkAuth(...Object.values(Role)), // Only authenticated users
  fileUploader.upload.single("file"), // Handle file upload
  UserControllers.updateUser // pass controller directly
);

export const UserRoutes = router;
