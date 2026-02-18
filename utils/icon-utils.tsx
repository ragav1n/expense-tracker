import React from 'react';
import {
    Tag, Plane, Home, Gift, Car, Utensils, ShoppingCart, Heart,
    Gamepad2, Music, Laptop, School, LucideIcon
} from 'lucide-react';

export const BUCKET_ICONS: Record<string, LucideIcon> = {
    Tag,
    Plane,
    Home,
    Gift,
    Car,
    Utensils,
    ShoppingCart,
    Heart,
    Gamepad2,
    Music,
    Laptop,
    School
};

export const getBucketIcon = (iconName: string) => {
    const Icon = BUCKET_ICONS[iconName] || Tag;
    return <Icon className="w-full h-full" />;
};
