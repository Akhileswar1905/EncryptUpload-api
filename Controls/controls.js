// // Updating User

// userRouter.put("/users/:id", async (req, res) => {
//   console.log(req.body);
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );

//     res.json(user);
//     console.log(user);
//   } catch (error) {
//     res.json(error);
//   }
// });

// // Delete user

// userRouter.delete("/users/:id", async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     res.send("User is deleted");
//   } catch (error) {
//     res.send("Error Occured");
//   }
// });

// // get a particular user

// userRouter.get("/users/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const user = await User.findById(id);
//     res.json(user);
//   } catch (error) {
//     res.json(error);
//   }
// });

// // Get all users
// userRouter.get("/users", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//     console.log(req.body);
//   } catch (error) {
//     // console.log(error.message());
//     res.send(error);
//   }
// });

// module.exports = userRouter;
