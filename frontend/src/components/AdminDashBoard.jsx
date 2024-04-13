import React from 'react';
import ResponsiveAppBar from './ResponsiveAppBar';
import SideBar from './SideBar';
import { CssBaseline } from '@mui/material';
import Analytics from './Analytics';
import '../styles/AdminDashboard.css'


const AdminDashBoard = () => {
  console.log('Homepage under construction.');
  return (
    <div>
      <CssBaseline/>
      <ResponsiveAppBar />
      <div className='parent'>
        <div className='child'><SideBar /></div>
        <div className='analytics-child'><Analytics /></div>
      </div>
    </div>
  )
}

export default AdminDashBoard;
