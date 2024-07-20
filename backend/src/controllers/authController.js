import { Register,Login, changepassword } from '../services/authService.js';

const RegisterHandler = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Name, email, and password are required' });
    return;
  }


  try {
    const result = await Register(username, email, password);
     res.status(200).json(result);
     return;
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

const LoginHandler = async (req, res) => {
  const {identifier, password} = req.body;
  if (!identifier || !password) {
    res.status(400).json({ message: 'identifier and password are required' });
    return;
  }

  try{
    const user = await Login(identifier, password);
    req.session.userId = user.id;
    res.status(200).json({ message: 'Login successful' });
  } catch(error){
    if(error.message === "Email or password incorrect"){
      res.status(400).json({ message: 'Email or password incorrect' });
    }else if(error.message === "Identifier cannot be null or empty"){
      res.status(400).json({message: "Identifier cannot be null or empty"});
    } else if(error.message === "User password not set"){
      res.status(400).json({message: "User password not set"});
    } else {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

const LogoutHandler = async (req, res)  => {
    req.session.destroy(err => {
        if(err){
            res.status(500).json({ message: 'Failed to logout' });
            return;
        }
        res.status(200).json({message: 'Success to logout'});
    });
}

const changepasswordHandler = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req.session;

  if(!oldPassword && !newPassword){
    res.status(400).json({ message: 'Old password and new password are required' });
    return;
  }

  try {
    const result = await changepassword(userId, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    if(error.message === "Password incorrect"){
      res.status(400).json({ message: 'Password incorrect' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

export { RegisterHandler, LogoutHandler,LoginHandler, changepasswordHandler };