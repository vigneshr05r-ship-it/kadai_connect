import React from 'react';

const Skeleton = ({ width = '100%', height = '100%', borderRadius = '8px', className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-parchment-dark ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-parchment overflow-hidden">
    <Skeleton height="160px" borderRadius="12px" className="mb-4" />
    <Skeleton width="60%" height="20px" className="mb-2" />
    <Skeleton width="40%" height="16px" className="mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton width="30%" height="24px" />
      <Skeleton width="24px" height="24px" borderRadius="50%" />
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center">
    <Skeleton width="64px" height="64px" borderRadius="50%" className="mb-2" />
    <Skeleton width="40px" height="12px" />
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-parchment">
    <Skeleton width="40%" height="12px" className="mb-2" />
    <Skeleton width="60%" height="32px" className="mb-1" />
    <Skeleton width="30%" height="10px" />
  </div>
);

export default Skeleton;
