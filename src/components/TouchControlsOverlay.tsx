import { useTouchUI, touchUIStore } from "@/lib/stores";
import { Move, Rotate3D } from "lucide-react";
import { useIsTouch } from "@/hooks/useIsTouch";
import React from "react";

export function TouchControlsOverlay() {
  const enabled = useIsTouch();
  const { left, right } = useTouchUI();
  const [leftTouchId, setLeftTouchId] = React.useState<number | null>(null);
  const [rightTouchId, setRightTouchId] = React.useState<number | null>(null);

  if (!enabled) return null;

  // Fixed positions for joysticks
  const leftCenterX = 80;
  const leftCenterY = window.innerHeight - 100;
  const rightCenterX = window.innerWidth - 80;
  const rightCenterY = window.innerHeight - 100;

  // Calculate nub position relative to fixed centers
  const leftDx = left.pos.x - left.center.x;
  const leftDy = left.pos.y - left.center.y;
  const leftMag = Math.hypot(leftDx, leftDy);
  const leftClamped = leftMag <= left.radius ? { x: leftDx, y: leftDy } : { x: (leftDx / leftMag) * left.radius, y: (leftDy / leftMag) * left.radius };

  const rightDx = right.pos.x - right.center.x;
  const rightDy = right.pos.y - right.center.y;
  const rightMag = Math.hypot(rightDx, rightDy);
  const rightClamped = rightMag <= right.radius ? { x: rightDx, y: rightDy } : { x: (rightDx / rightMag) * right.radius, y: (rightDy / rightMag) * right.radius };

  // Helper to check if touch is in left joystick area
  const isInLeftJoystick = (x: number, y: number) => {
    const dx = x - leftCenterX;
    const dz = y - leftCenterY;
    return Math.hypot(dx, dz) <= left.radius;
  };

  // Helper to check if touch is in right joystick area
  const isInRightJoystick = (x: number, y: number) => {
    const dx = x - rightCenterX;
    const dz = y - rightCenterY;
    return Math.hypot(dx, dz) <= right.radius;
  };

  // Global unified touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    let touchedJoystick = false;
    Array.from(e.changedTouches).forEach((touch) => {
      if (isInLeftJoystick(touch.clientX, touch.clientY) && leftTouchId === null) {
        touchedJoystick = true;
        setLeftTouchId(touch.identifier);
        touchUIStore.setState({
          left: {
            ...left,
            active: true,
            center: { x: leftCenterX, y: leftCenterY },
            pos: { x: touch.clientX, y: touch.clientY },
          },
        });
      } else if (isInRightJoystick(touch.clientX, touch.clientY) && rightTouchId === null) {
        touchedJoystick = true;
        setRightTouchId(touch.identifier);
        touchUIStore.setState({
          right: {
            ...right,
            active: true,
            center: { x: rightCenterX, y: rightCenterY },
            pos: { x: touch.clientX, y: touch.clientY },
          },
        });
      }
    });
    if (touchedJoystick) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    let movedJoystick = false;
    Array.from(e.touches).forEach((touch) => {
      if (touch.identifier === leftTouchId) {
        movedJoystick = true;
        touchUIStore.setState({
          left: {
            ...left,
            pos: { x: touch.clientX, y: touch.clientY },
          },
        });
      } else if (touch.identifier === rightTouchId) {
        movedJoystick = true;
        touchUIStore.setState({
          right: {
            ...right,
            pos: { x: touch.clientX, y: touch.clientY },
          },
        });
      }
    });
    if (movedJoystick) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    let endedJoystick = false;
    Array.from(e.changedTouches).forEach((touch) => {
      if (touch.identifier === leftTouchId) {
        endedJoystick = true;
        setLeftTouchId(null);
        touchUIStore.setState({
          left: {
            ...left,
            active: false,
            pos: { x: left.center.x, y: left.center.y },
          },
        });
      } else if (touch.identifier === rightTouchId) {
        endedJoystick = true;
        setRightTouchId(null);
        touchUIStore.setState({
          right: {
            ...right,
            active: false,
            pos: { x: right.center.x, y: right.center.y },
          },
        });
      }
    });
    if (endedJoystick) {
      e.preventDefault();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40 select-none">
      {/* Invisible hit target for left joystick */}
      <div
        className="absolute pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          left: leftCenterX - left.radius,
          top: leftCenterY - left.radius,
          width: left.radius * 2,
          height: left.radius * 2,
          touchAction: "none",
        }}
      />

      {/* Invisible hit target for right joystick */}
      <div
        className="absolute pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          left: rightCenterX - right.radius,
          top: rightCenterY - right.radius,
          width: right.radius * 2,
          height: right.radius * 2,
          touchAction: "none",
        }}
      />

      {/* Visual representation - pointer-events-none so it doesn't interfere */}
      <div className="pointer-events-none absolute inset-0 z-40 select-none">
        {/* Left joystick - always visible */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: leftCenterX - left.radius,
            top: leftCenterY - left.radius,
            width: left.radius * 2,
            height: left.radius * 2,
          }}
        >
          <div className="absolute inset-0 rounded-full backdrop-blur" style={{ borderWidth: 2, borderColor: "#55fc27", backgroundColor: "rgba(85, 252, 39, 0.1)" }} />
          {/* Icon follows nub */}
          <div
            className="absolute grid place-items-center pointer-events-none"
            style={{
              width: left.radius * 0.6,
              height: left.radius * 0.6,
              left:
                left.radius +
                leftClamped.x -
                (left.radius * 0.6) / 2,
              top:
                left.radius +
                leftClamped.y -
                (left.radius * 0.6) / 2,
              color: "#55fc27",
            }}
          >
            <Move className="size-4" />
          </div>
          {/* Draggable nub background */}
          <div
            className="absolute rounded-full"
            style={{
              width: left.radius * 0.6,
              height: left.radius * 0.6,
              left:
                left.radius +
                leftClamped.x -
                (left.radius * 0.6) / 2,
              top:
                left.radius +
                leftClamped.y -
                (left.radius * 0.6) / 2,
              backgroundColor: "#55fc27",
            }}
          />
        </div>

        {/* Left joystick label */}
        <div
          className="absolute text-xs font-semibold pointer-events-none"
          style={{
            left: leftCenterX - left.radius,
            top: leftCenterY + left.radius + 12,
            textAlign: "center",
            width: left.radius * 2,
            color: "#55fc27",
          }}
        >
          Bewegen
        </div>

        {/* Right joystick - always visible */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: rightCenterX - right.radius,
            top: rightCenterY - right.radius,
            width: right.radius * 2,
            height: right.radius * 2,
          }}
        >
          <div className="absolute inset-0 rounded-full backdrop-blur" style={{ borderWidth: 2, borderColor: "#55fc27", backgroundColor: "rgba(85, 252, 39, 0.1)" }} />
          {/* Icon follows nub */}
          <div
            className="absolute grid place-items-center pointer-events-none"
            style={{
              width: right.radius * 0.6,
              height: right.radius * 0.6,
              left:
                right.radius +
                rightClamped.x -
                (right.radius * 0.6) / 2,
              top:
                right.radius +
                rightClamped.y -
                (right.radius * 0.6) / 2,
              color: "#55fc27",
            }}
          >
            <Rotate3D className="size-4" />
          </div>
          {/* Draggable nub background */}
          <div
            className="absolute rounded-full"
            style={{
              width: right.radius * 0.6,
              height: right.radius * 0.6,
              left:
                right.radius +
                rightClamped.x -
                (right.radius * 0.6) / 2,
              top:
                right.radius +
                rightClamped.y -
                (right.radius * 0.6) / 2,
              backgroundColor: "#55fc27",
            }}
          />
        </div>

        {/* Right joystick label */}
        <div
          className="absolute text-xs font-semibold pointer-events-none"
          style={{
            left: rightCenterX - right.radius,
            top: rightCenterY + right.radius + 12,
            textAlign: "center",
            width: right.radius * 2,
            color: "#55fc27",
          }}
        >
          Umsehen
        </div>
      </div>
    </div>
  );
}
