'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';

import { cn } from '@/lib/utils';

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;
const DrawerViewport = DrawerPrimitive.Viewport;

const DrawerBackdrop = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Backdrop>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Backdrop
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
      'transition-opacity duration-200 ease-out',
      'data-[starting-style]:opacity-0',
      'data-[ending-style]:opacity-0',
      className,
    )}
    {...props}
  />
));
DrawerBackdrop.displayName = 'DrawerBackdrop';

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Popup>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerBackdrop />
    <DrawerViewport className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[640px]">
      <DrawerPrimitive.Popup
        ref={ref}
        className={cn(
          'bg-card text-card-foreground border-t border-border shadow-lg',
          'rounded-t-3xl',
          'flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] flex-col overflow-hidden',
          'short-landscape:max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-0.5rem)]',
          'transition-all duration-200 ease-out',
          'data-[starting-style]:translate-y-full',
          'data-[ending-style]:translate-y-full',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto mb-3 mt-3 h-1 w-12 shrink-0 rounded-full bg-border"
          aria-hidden
        />
        <DrawerPrimitive.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-0 outline-none [-webkit-overflow-scrolling:touch]">
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Popup>
    </DrawerViewport>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 mb-4 text-center', className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 mt-6', className)} {...props} />
  );
}

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-foreground leading-tight',
      className,
    )}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = 'DrawerDescription';

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};
