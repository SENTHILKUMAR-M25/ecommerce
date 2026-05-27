import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';

import {
  User,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phno, setPhno] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { user, loading } = useSelector(
    (state) => state.auth
  );

  const redirectParam = new URLSearchParams(
    location.search
  ).get('redirect');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      toast(
        `Registration successful! Welcome ${user.name}`,
        'success'
      );

      if (redirectParam) {
        navigate(`/${redirectParam}`);
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectParam, toast]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !phno ||
      !street ||
      !city ||
      !state ||
      !zipCode ||
      !password ||
      !confirmPassword
    ) {
      toast('Please fill all fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      toast(
        'Password must contain at least 6 characters.',
        'error'
      );
      return;
    }

    const address = {
      street,
      city,
      state,
      zipCode,
      country,
    };

    try {
      await dispatch(
        registerUser({
          name,
          email,
          phno,
          address,
          password,
        })
      ).unwrap();

      navigate('/login');
    } catch (err) {
      toast(
        err || 'Registration failed. Try again.',
        'error'
      );
    }
  };

  return (
    // <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-14">

    //   <div className="relative z-10   gap-10 items-center">
    //     <div className="w-full">

    //       <div className="backdrop-blur-2xl bg-white/10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-10">

    //         {/* Logo */}
    //         <div className="text-center mb-8">

    //           <Link
    //             to="/"
    //             className="text-5xl font-black tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent"
    //           >
    //             AURA
    //           </Link>

    //           <h2 className="text-3xl font-bold text-black mt-6">
    //             Create Account
    //           </h2>

    //           <p className="text-sm text-slate-900 mt-2">
    //             Start your premium shopping experience today.
    //           </p>
    //         </div>

    //         {/* FORM */}
    //         <form
    //           onSubmit={handleRegisterSubmit}
    //           className="space-y-5"
    //         >

    //           {/* Grid */}
    //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

    //             {/* NAME */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Full Name
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type="text"
    //                   placeholder="Senthil Kumar"
    //                   value={name}
    //                   onChange={(e) =>
    //                     setName(e.target.value)
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <User className="absolute left-4 top-4 w-5 h-5 text-slate-900" />
    //               </div>
    //             </div>

    //             {/* EMAIL */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Email Address
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type="email"
    //                   placeholder="example@gmail.com"
    //                   value={email}
    //                   onChange={(e) =>
    //                     setEmail(e.target.value)
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-900" />
    //               </div>
    //             </div>

    //             {/* PHONE */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Phone Number
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type="text"
    //                   placeholder="+91 9876543210"
    //                   value={phno}
    //                   onChange={(e) =>
    //                     setPhno(e.target.value)
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-900" />
    //               </div>
    //             </div>

    //             {/* STREET */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Street Address
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type="text"
    //                   placeholder="Street Address"
    //                   value={street}
    //                   onChange={(e) =>
    //                     setStreet(e.target.value)
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-900" />
    //               </div>
    //             </div>

    //             {/* CITY */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 City
    //               </label>

    //               <input
    //                 type="text"
    //                 placeholder="Chennai"
    //                 value={city}
    //                 onChange={(e) =>
    //                   setCity(e.target.value)
    //                 }
    //                 className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //               />
    //             </div>

    //             {/* STATE */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 State
    //               </label>

    //               <input
    //                 type="text"
    //                 placeholder="Tamil Nadu"
    //                 value={state}
    //                 onChange={(e) =>
    //                   setState(e.target.value)
    //                 }
    //                 className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //               />
    //             </div>

    //             {/* ZIP */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Zip Code
    //               </label>

    //               <input
    //                 type="text"
    //                 placeholder="600001"
    //                 value={zipCode}
    //                 onChange={(e) =>
    //                   setZipCode(e.target.value)
    //                 }
    //                 className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //               />
    //             </div>

    //             {/* COUNTRY */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Country
    //               </label>

    //               <input
    //                 type="text"
    //                 value={country}
    //                 onChange={(e) =>
    //                   setCountry(e.target.value)
    //                 }
    //                 className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //               />
    //             </div>

    //           </div>

    //           {/* PASSWORDS */}
    //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

    //             {/* PASSWORD */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Password
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type={
    //                     showPassword ? 'text' : 'password'
    //                   }
    //                   placeholder="••••••••"
    //                   value={password}
    //                   onChange={(e) =>
    //                     setPassword(e.target.value)
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-12 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-900" />

    //                 <button
    //                   type="button"
    //                   onClick={() =>
    //                     setShowPassword(!showPassword)
    //                   }
    //                   className="absolute right-4 top-4 text-slate-900"
    //                 >
    //                   {showPassword ? (
    //                     <EyeOff className="w-5 h-5" />
    //                   ) : (
    //                     <Eye className="w-5 h-5" />
    //                   )}
    //                 </button>
    //               </div>
    //             </div>

    //             {/* CONFIRM PASSWORD */}
    //             <div className="space-y-2">
    //               <label className="text-xs uppercase tracking-widest text-slate-900 font-bold">
    //                 Confirm Password
    //               </label>

    //               <div className="relative">
    //                 <input
    //                   type={
    //                     showConfirmPassword
    //                       ? 'text'
    //                       : 'password'
    //                   }
    //                   placeholder="••••••••"
    //                   value={confirmPassword}
    //                   onChange={(e) =>
    //                     setConfirmPassword(
    //                       e.target.value
    //                     )
    //                   }
    //                   className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-12 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    //                 />

    //                 <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-900" />

    //                 <button
    //                   type="button"
    //                   onClick={() =>
    //                     setShowConfirmPassword(
    //                       !showConfirmPassword
    //                     )
    //                   }
    //                   className="absolute right-4 top-4 text-slate-900"
    //                 >
    //                   {showConfirmPassword ? (
    //                     <EyeOff className="w-5 h-5" />
    //                   ) : (
    //                     <Eye className="w-5 h-5" />
    //                   )}
    //                 </button>
    //               </div>
    //             </div>

    //           </div>

    //           {/* SUBMIT */}
    //           <div className="pt-4">

    //             <button
    //               type="submit"
    //               disabled={loading}
    //               className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-black font-bold shadow-[0_10px_40px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3"
    //             >
    //               <UserPlus className="w-5 h-5" />

    //               {loading
    //                 ? 'Creating Account...'
    //                 : 'Create Premium Account'}
    //             </button>

    //           </div>

    //         </form>

    //         {/* Footer */}
    //         <div className="mt-8 text-center">

    //           <p className="text-sm text-slate-900">
    //             Already have an account?
    //           </p>

    //           <Link
    //             to={`/login${
    //               redirectParam
    //                 ? `?redirect=${redirectParam}`
    //                 : ''
    //             }`}
    //             className="mt-3 inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
    //           >
    //             Sign In
    //             <ArrowRight className="w-4 h-4" />
    //           </Link>

    //         </div>

    //       </div>

    //     </div>

    //   </div>
    // </div>




    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-14 ">



  <div className="relative z-10 w-full max-w-5xl gap-10 items-center">
    <div className="w-full">

      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 sm:p-10">

        {/* Logo */}
        <div className="text-center mb-10">

          <Link
            to="/"
            className="text-5xl font-black tracking-[0.25em] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            SUMAIYA'99
          </Link>

          <h2 className="text-3xl sm:text-4xl font-black text-black mt-6 tracking-tight">
            Create Account
          </h2>

          <p className="text-sm text-slate-900 mt-3 max-w-md mx-auto leading-relaxed">
            Start your premium shopping experience today.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleRegisterSubmit}
          className="space-y-6"
        >

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* NAME */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Full Name
              </label>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="Senthil Kumar"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <User className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Email Address
              </label>

              <div className="relative group">
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Phone Number
              </label>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phno}
                  onChange={(e) =>
                    setPhno(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>

            {/* STREET */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Street Address
              </label>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={street}
                  onChange={(e) =>
                    setStreet(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>

            {/* CITY */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                City
              </label>

              <input
                type="text"
                placeholder="Chennai"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
              />
            </div>

            {/* STATE */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                State
              </label>

              <input
                type="text"
                placeholder="Tamil Nadu"
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
              />
            </div>

            {/* ZIP */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Zip Code
              </label>

              <input
                type="text"
                placeholder="600001"
                value={zipCode}
                onChange={(e) =>
                  setZipCode(e.target.value)
                }
                className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
              />
            </div>

            {/* COUNTRY */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Country
              </label>

              <input
                type="text"
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
                className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
              />
            </div>

          </div>

          {/* PASSWORDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Password
              </label>

              <div className="relative group">
                <input
                  type={
                    showPassword ? 'text' : 'password'
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-12 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-4 text-slate-900 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-900 font-bold">
                Confirm Password
              </label>

              <div className="relative group">
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl pl-12 pr-12 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all"
                />

                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-900 group-focus-within:text-cyan-400 transition-colors" />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-4 text-slate-900 hover:text-cyan-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* SUBMIT */}
          <div className="pt-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 text-black font-black tracking-wide shadow-[0_10px_40px_rgba(6,182,212,0.35)] flex items-center justify-center gap-3"
            >
              <UserPlus className="w-5 h-5" />

              {loading
                ? 'Creating Account...'
                : 'Create Premium Account'}
            </button>

          </div>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center">

          <p className="text-sm text-slate-900">
            Already have an account?
          </p>

          <Link
            to={`/login${
              redirectParam
                ? `?redirect=${redirectParam}`
                : ''
            }`}
            className="mt-3 inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>

    </div>

  </div>
</div>
  );
};

export default RegisterPage;