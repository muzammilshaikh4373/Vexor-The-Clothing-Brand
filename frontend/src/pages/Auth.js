import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { setCredentials } from '../store/slices/authSlice';
import api from '../utils/api';
import { toast } from 'sonner';

export const Auth = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { phone });
      setMockOtp(response.data.mock_otp);
      setOtpSent(true);
      toast.success(`OTP sent! Use: ${response.data.mock_otp}`);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      dispatch(setCredentials(response.data));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="auth-page" className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl tracking-tighter uppercase mb-2">VEXOR</h1>
          <p className="text-gray-600">Enter your phone number to continue</p>
        </div>

        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  data-testid="phone-input"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="h-12"
                />
              </div>
              <Button
                data-testid="send-otp-button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-12 rounded-none uppercase tracking-widest"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-sm border border-accent">
                <p className="text-sm font-semibold">Test Mode: Use OTP</p>
                <p className="text-2xl font-bold font-heading mt-2">{mockOtp}</p>
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold uppercase tracking-widest mb-2">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  data-testid="otp-input"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                data-testid="verify-otp-button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-12 rounded-none uppercase tracking-widest"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <button
                data-testid="change-phone-button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="w-full text-sm uppercase tracking-widest hover:text-accent transition-colors"
              >
                Change Phone Number
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};