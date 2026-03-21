import { describe, expect, it, vi } from "vitest";
import { optimizeCameraTrack } from "../src/camera-optimization.js";

describe("optimizeCameraTrack", () => {
  it("returns a safe fallback when track constraints are unavailable", async () => {
    const result = await optimizeCameraTrack({
      getSettings() {
        return { width: 640, height: 480 };
      }
    });

    expect(result.optimized).toBe(false);
    expect(result.settings.width).toBe(640);
  });

  it("applies preferred constraints when the track exposes capabilities", async () => {
    const applyConstraints = vi.fn(async () => {});
    const track = {
      applyConstraints,
      getCapabilities() {
        return {
          width: { min: 640, max: 1920 },
          height: { min: 480, max: 1080 },
          frameRate: { min: 15, max: 60 },
          resizeMode: ["none", "crop-and-scale"],
          focusMode: ["continuous"],
          zoom: { min: 1, max: 2 }
        };
      },
      getSettings() {
        return {
          width: 1280,
          height: 720,
          frameRate: 30
        };
      }
    };

    const result = await optimizeCameraTrack(track);

    expect(result.optimized).toBe(true);
    expect(applyConstraints).toHaveBeenCalledTimes(1);
    expect(result.appliedConstraints.width.ideal).toBe(1280);
    expect(result.appliedConstraints.height.ideal).toBe(720);
    expect(result.appliedConstraints.advanced).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resizeMode: "none" }),
        expect.objectContaining({ focusMode: "continuous" })
      ])
    );
  });
});
