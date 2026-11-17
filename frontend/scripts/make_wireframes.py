import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.spatial import Delaunay
import math
import os

os.makedirs('public', exist_ok=True)
W, H = 1920, 1080

def create_base_gradient(w=W, h=H, center_boost=1.0):
    """Deep royal navy gradient matching the user reference image (#071326 to #10325e)"""
    y, x = np.ogrid[:h, :w]
    cy, cx = h * 0.5, w * 0.5
    dist = np.sqrt(((x - cx) / (w * 0.55))**2 + ((y - cy) / (h * 0.55))**2)
    dist = np.clip(dist, 0, 1.3)
    
    # Center: (15, 45, 90) * boost -> Edge: (5, 12, 26)
    r = np.clip((14 * center_boost) * (1 - dist*0.8) + 5 * (dist*0.8), 0, 255).astype(np.uint8)
    g = np.clip((44 * center_boost) * (1 - dist*0.8) + 12 * (dist*0.8), 0, 255).astype(np.uint8)
    b = np.clip((88 * center_boost) * (1 - dist*0.8) + 26 * (dist*0.8), 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([r, g, b]))

def add_ambient_particles(draw, count=160, seed=42):
    """Scatters subtle glowing bokeh particles across the scene"""
    rng = np.random.RandomState(seed)
    xs = rng.uniform(0, W, count)
    ys = rng.uniform(0, H, count)
    radii = rng.uniform(1.0, 3.5, count)
    alphas = rng.uniform(40, 160, count)
    
    for x, y, r, a in zip(xs, ys, radii, alphas):
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(0, 220, 255, int(a)))

def rotate_3d(points, rx, ry, rz):
    """Rotates an Nx3 array of points by Euler angles rx, ry, rz in radians"""
    ax, ay, az = rx, ry, rz
    Rx = np.array([[1, 0, 0], [0, np.cos(ax), -np.sin(ax)], [0, np.sin(ax), np.cos(ax)]])
    Ry = np.array([[np.cos(ay), 0, np.sin(ay)], [0, 1, 0], [-np.sin(ay), 0, np.cos(ay)]])
    Rz = np.array([[np.cos(az), -np.sin(az), 0], [np.sin(az), np.cos(az), 0], [0, 0, 1]])
    R = Rz @ Ry @ Rx
    return points @ R.T

def project(points_3d, cx=W/2, cy=H/2, fov=1200, z_offset=1300):
    """Perspective projection from 3D to 2D screen coordinates"""
    proj = []
    for p in points_3d:
        z = p[2] + z_offset
        if z <= 10:
            z = 10
        px = cx + (p[0] * fov) / z
        py = cy + (p[1] * fov) / z
        proj.append((px, py))
    return proj

# ──────────────────────────────────────────────────────────
# 1. HERO SLIDE: Enhanced user reference image with extra wireframe constellations
# ──────────────────────────────────────────────────────────
def make_hero():
    print("Building bg_wireframe_hero.jpg...")
    base = create_base_gradient(center_boost=1.15)
    
    # Load user's reference image
    if os.path.exists('public/wireframe_laptop_education.png'):
        src = Image.open('public/wireframe_laptop_education.png').convert('RGBA')
        w, h = src.size
        target_w = 1100
        target_h = int(h * (target_w / w))
        src_scaled = src.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Feather mask
        feather = 50
        mask_arr = np.ones((target_h, target_w), dtype=np.float32)
        for i in range(feather):
            factor = (i / feather) ** 1.4
            mask_arr[i, :] *= factor
            mask_arr[target_h - 1 - i, :] *= factor
            mask_arr[:, i] *= factor
            mask_arr[:, target_w - 1 - i] *= factor
        mask = Image.fromarray((mask_arr * 255).astype(np.uint8))
        
        pos_x = (W - target_w) // 2
        pos_y = (H - target_h) // 2 + 10
        base.paste(src_scaled, (pos_x, pos_y), mask)
        
    # Add ambient wireframe elements in the background / periphery
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=140, seed=101)
    
    # Floating wireframe octahedron on left
    def draw_wire_poly(cx, cy, radius, sides=6, rot=0.2):
        pts = []
        for i in range(sides):
            ang = i * (2 * math.pi / sides) + rot
            pts.append((cx + radius * math.cos(ang), cy + radius * math.sin(ang) * 0.6))
        for i in range(sides):
            draw.line([pts[i], pts[(i+1)%sides]], fill=(0, 200, 255, 120), width=1)
            draw.line([pts[i], (cx, cy - radius*0.8)], fill=(0, 230, 255, 140), width=1)
            draw.line([pts[i], (cx, cy + radius*0.8)], fill=(0, 180, 255, 90), width=1)
            draw.ellipse([pts[i][0]-2.5, pts[i][1]-2.5, pts[i][0]+2.5, pts[i][1]+2.5], fill=(180, 240, 255, 200))
        draw.ellipse([cx-3, cy-radius*0.8-3, cx+3, cy-radius*0.8+3], fill=(220, 255, 255, 240))
        draw.ellipse([cx-3, cy+radius*0.8-3, cx+3, cy+radius*0.8+3], fill=(180, 240, 255, 200))

    draw_wire_poly(220, 280, 80, sides=5, rot=0.5)
    draw_wire_poly(1700, 320, 95, sides=6, rot=0.8)
    draw_wire_poly(1640, 780, 70, sides=4, rot=0.3)
    draw_wire_poly(260, 760, 85, sides=6, rot=0.1)
    
    glow = wire.filter(ImageFilter.GaussianBlur(radius=5))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_hero.jpg', quality=95)

# ──────────────────────────────────────────────────────────
# 2. THE PROBLEM: Entangled wireframe maze & fragmented network
# ──────────────────────────────────────────────────────────
def make_problem():
    print("Building bg_wireframe_problem.jpg...")
    base = create_base_gradient(center_boost=0.95)
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=180, seed=202)
    
    # Create an irregular low-poly faceted landscape / mesh floating in space
    rng = np.random.RandomState(42)
    n_pts = 90
    pts_x = rng.uniform(-650, 650, n_pts)
    pts_y = rng.uniform(-350, 350, n_pts)
    pts_z = np.sin(pts_x / 180.0) * np.cos(pts_y / 180.0) * 180.0 + rng.uniform(-80, 80, n_pts)
    pts_3d = np.column_stack([pts_x, pts_y, pts_z])
    
    # 3D rotation
    pts_rot = rotate_3d(pts_3d, np.radians(28), np.radians(-25), np.radians(10))
    proj_pts = project(pts_rot, cx=W/2, cy=H/2, fov=1200, z_offset=1300)
    
    # 2D Delaunay on projected points for wireframe faces
    tri = Delaunay([p for p in proj_pts])
    
    # Draw wireframe triangles with translucent shading
    for simplex in tri.simplices:
        p1, p2, p3 = [proj_pts[i] for i in simplex]
        # Only draw if triangle isn't too huge
        d12 = math.hypot(p1[0]-p2[0], p1[1]-p2[1])
        d23 = math.hypot(p2[0]-p3[0], p2[1]-p3[1])
        d31 = math.hypot(p3[0]-p1[0], p3[1]-p1[1])
        if max(d12, d23, d31) < 260:
            avg_z = (pts_rot[simplex[0]][2] + pts_rot[simplex[1]][2] + pts_rot[simplex[2]][2]) / 3
            poly_alpha = int(np.clip(16 + avg_z * 0.05, 8, 35))
            draw.polygon([p1, p2, p3], fill=(0, 120, 220, poly_alpha), outline=(0, 195, 255, int(np.clip(110 + avg_z*0.2, 50, 220))))
            
    # Nodes on top
    for i, p in enumerate(proj_pts):
        avg_z = pts_rot[i][2]
        r = 3.5 if avg_z > 0 else 2.5
        draw.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=(180, 240, 255, 240))
        draw.ellipse([p[0]-1, p[1]-1, p[0]+1, p[1]+1], fill=(255, 255, 255, 255))
        
    glow = wire.filter(ImageFilter.GaussianBlur(radius=6))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_problem.jpg', quality=95)

# ──────────────────────────────────────────────────────────
# 3. UNDERSTAND: 3D Geodesic Knowledge Sphere with Orbital Rings
# ──────────────────────────────────────────────────────────
def make_understand():
    print("Building bg_wireframe_understand.jpg...")
    base = create_base_gradient(center_boost=1.1)
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=160, seed=303)
    
    # 3D Geodesic sphere vertices (Icosahedron subdivided)
    phi = (1 + np.sqrt(5)) / 2
    verts = [
        [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ]
    verts = np.array(verts, dtype=np.float32)
    verts /= np.linalg.norm(verts[0])
    
    # Subdivide edges to get geodesic dome
    sub_verts = list(verts)
    for i in range(len(verts)):
        for j in range(i + 1, len(verts)):
            if np.linalg.norm(verts[i] - verts[j]) < 1.1:
                mid = (verts[i] + verts[j]) / 2.0
                mid /= np.linalg.norm(mid)
                sub_verts.append(mid)
                
    pts_sphere = np.array(sub_verts, dtype=np.float32) * 310
    pts_rot = rotate_3d(pts_sphere, np.radians(20), np.radians(35), np.radians(10))
    proj_pts = project(pts_rot, cx=W/2, cy=H/2 - 20, fov=1200, z_offset=1300)
    
    # Draw geodesic lines
    for i in range(len(pts_rot)):
        for j in range(i + 1, len(pts_rot)):
            d = np.linalg.norm(pts_rot[i] - pts_rot[j])
            if d < 185:
                avg_z = (pts_rot[i][2] + pts_rot[j][2]) / 2
                alpha = int(np.clip(130 + avg_z * 0.35, 40, 240))
                draw.line([proj_pts[i], proj_pts[j]], fill=(0, 210, 255, alpha), width=2)
                
    # Draw orbital rings around the sphere (like atomic / planetary orbits)
    for ring_ang in [0.4, -0.6, 1.2]:
        ring_pts_3d = []
        for a in np.linspace(0, 2*math.pi, 80):
            rx = 430 * math.cos(a)
            ry = 430 * math.sin(a)
            rz = 0
            ring_pts_3d.append([rx, ry, rz])
        ring_rot = rotate_3d(np.array(ring_pts_3d), np.radians(45) * ring_ang, np.radians(60) * ring_ang, np.radians(20))
        proj_ring = project(ring_rot, cx=W/2, cy=H/2 - 20, fov=1200, z_offset=1300)
        for k in range(len(proj_ring) - 1):
            draw.line([proj_ring[k], proj_ring[k+1]], fill=(0, 220, 255, 95), width=1)
            
    # Nodes on the sphere
    for i, p in enumerate(proj_pts):
        avg_z = pts_rot[i][2]
        r = 4.0 if avg_z > 0 else 2.5
        draw.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=(200, 245, 255, 255))
        
    glow = wire.filter(ImageFilter.GaussianBlur(radius=6))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_understand.jpg', quality=95)

# ──────────────────────────────────────────────────────────
# 4. DIAGNOSE: 3D Faceted Radar Diamond & Competency Matrix
# ──────────────────────────────────────────────────────────
def make_diagnose():
    print("Building bg_wireframe_diagnose.jpg...")
    base = create_base_gradient(center_boost=1.05)
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=160, seed=404)
    
    # 3D Diamond / Dual-pyramid wireframe (bipyramid)
    # Equatorial polygon
    n_sides = 8
    radius = 330
    pts_eq = []
    for i in range(n_sides):
        ang = i * (2 * math.pi / n_sides)
        pts_eq.append([radius * math.cos(ang), 0, radius * math.sin(ang)])
        
    top_apex = [0, -320, 0]
    bot_apex = [0, 320, 0]
    inner_top = [0, -180, 0]
    inner_bot = [0, 180, 0]
    
    pts_all = pts_eq + [top_apex, bot_apex, inner_top, inner_bot]
    pts_rot = rotate_3d(np.array(pts_all), np.radians(22), np.radians(40), np.radians(5))
    proj_pts = project(pts_rot, cx=W/2, cy=H/2 - 10, fov=1200, z_offset=1300)
    
    eq_idx = list(range(n_sides))
    t_idx = n_sides
    b_idx = n_sides + 1
    it_idx = n_sides + 2
    ib_idx = n_sides + 3
    
    # Draw equatorial ring
    for i in range(n_sides):
        p1 = proj_pts[eq_idx[i]]
        p2 = proj_pts[eq_idx[(i+1)%n_sides]]
        draw.line([p1, p2], fill=(0, 220, 255, 200), width=2)
        # to top apex
        draw.line([p1, proj_pts[t_idx]], fill=(0, 240, 255, 180), width=2)
        # to bot apex
        draw.line([p1, proj_pts[b_idx]], fill=(0, 180, 255, 140), width=2)
        # to inner apexes (benchmark target envelope)
        draw.line([p1, proj_pts[it_idx]], fill=(0, 160, 230, 80), width=1)
        draw.line([p1, proj_pts[ib_idx]], fill=(0, 140, 210, 60), width=1)
        
        # Facet filling with semi-transparent cyan
        draw.polygon([p1, p2, proj_pts[t_idx]], fill=(0, 140, 220, 25))
        
    # Floating concentric circular grid beneath
    grid_pts_3d = []
    for r in [200, 350, 500]:
        for a in np.linspace(0, 2*math.pi, 60):
            grid_pts_3d.append([r * math.cos(a), 340, r * math.sin(a)])
    grid_rot = rotate_3d(np.array(grid_pts_3d), np.radians(22), np.radians(40), np.radians(5))
    proj_grid = project(grid_rot, cx=W/2, cy=H/2 - 10, fov=1200, z_offset=1300)
    for k in range(len(proj_grid) - 1):
        if k % 60 != 59:
            draw.line([proj_grid[k], proj_grid[k+1]], fill=(0, 180, 255, 60), width=1)
            
    # Nodes
    for p in proj_pts:
        draw.ellipse([p[0]-3.5, p[1]-3.5, p[0]+3.5, p[1]+3.5], fill=(220, 255, 255, 255))
        
    glow = wire.filter(ImageFilter.GaussianBlur(radius=6))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_diagnose.jpg', quality=95)

# ──────────────────────────────────────────────────────────
# 5. ADAPT: 3D Perspective Digital Pathway & Neural Circuit Tree
# ──────────────────────────────────────────────────────────
def make_adapt():
    print("Building bg_wireframe_adapt.jpg...")
    base = create_base_gradient(center_boost=1.1)
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=160, seed=505)
    
    # Perspective cyber grid floor
    z_vals = np.linspace(200, 1800, 20)
    x_lanes = np.linspace(-700, 700, 15)
    
    # Longitudinal lines
    for x in x_lanes:
        line_pts = []
        for z in z_vals:
            y = 350 + np.sin(x*0.01 + z*0.005) * 40
            line_pts.append([x, y, z])
        proj = project(np.array(line_pts), cx=W/2, cy=H/2, fov=1200, z_offset=600)
        for k in range(len(proj) - 1):
            alpha = int(np.clip(220 - (line_pts[k][2] / 1800.0) * 180, 30, 220))
            draw.line([proj[k], proj[k+1]], fill=(0, 200, 255, alpha), width=1)
            
    # Latitudinal lines (grid crosses)
    for z in z_vals[::2]:
        line_pts = []
        for x in x_lanes:
            y = 350 + np.sin(x*0.01 + z*0.005) * 40
            line_pts.append([x, y, z])
        proj = project(np.array(line_pts), cx=W/2, cy=H/2, fov=1200, z_offset=600)
        for k in range(len(proj) - 1):
            alpha = int(np.clip(200 - (z / 1800.0) * 160, 20, 200))
            draw.line([proj[k], proj[k+1]], fill=(0, 200, 255, alpha), width=1)
            
    # Floating branching roadmap nodes in air
    roadmap_levels = [
        [-300, -50, 800], [0, -120, 700], [300, -70, 800],
        [-180, -220, 500], [180, -200, 520],
        [0, -320, 350]
    ]
    rm_proj = project(np.array(roadmap_levels), cx=W/2, cy=H/2, fov=1200, z_offset=600)
    
    # Connections
    conns = [(0, 3), (1, 3), (1, 4), (2, 4), (3, 5), (4, 5)]
    for i, j in conns:
        draw.line([rm_proj[i], rm_proj[j]], fill=(0, 240, 255, 220), width=2)
        
    for p in rm_proj:
        draw.ellipse([p[0]-5, p[1]-5, p[0]+5, p[1]+5], fill=(220, 255, 255, 255))
        draw.ellipse([p[0]-8, p[1]-8, p[0]+8, p[1]+8], outline=(0, 230, 255, 200), width=1)
        
    glow = wire.filter(ImageFilter.GaussianBlur(radius=5))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_adapt.jpg', quality=95)

# ──────────────────────────────────────────────────────────
# 6. CAREER / CTA: 3D Wireframe Constellation & Global Planetary Network
# ──────────────────────────────────────────────────────────
def make_career():
    print("Building bg_wireframe_career.jpg...")
    base = create_base_gradient(center_boost=1.2)
    wire = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wire)
    add_ambient_particles(draw, count=220, seed=606)
    
    # Planetary wireframe globe
    n_lat = 12
    n_lon = 24
    radius = 360
    
    globe_pts = []
    # Latitude rings
    for lat in np.linspace(-math.pi/2 * 0.85, math.pi/2 * 0.85, n_lat):
        r_lat = radius * math.cos(lat)
        y_lat = radius * math.sin(lat)
        ring = []
        for lon in np.linspace(0, 2*math.pi, n_lon, endpoint=False):
            x = r_lat * math.cos(lon)
            z = r_lat * math.sin(lon)
            ring.append([x, y_lat, z])
        globe_pts.append(ring)
        
    # Flatten & rotate
    flat_pts = [p for ring in globe_pts for p in ring]
    rot_globe = rotate_3d(np.array(flat_pts), np.radians(25), np.radians(45), np.radians(15))
    proj_globe = project(rot_globe, cx=W/2, cy=H/2 + 20, fov=1200, z_offset=1300)
    
    # Draw lat lines
    for i in range(n_lat):
        start = i * n_lon
        for j in range(n_lon):
            p1 = proj_globe[start + j]
            p2 = proj_globe[start + (j + 1) % n_lon]
            draw.line([p1, p2], fill=(0, 200, 255, 80), width=1)
            
    # Draw lon lines
    for j in range(n_lon):
        for i in range(n_lat - 1):
            p1 = proj_globe[i * n_lon + j]
            p2 = proj_globe[(i + 1) * n_lon + j]
            draw.line([p1, p2], fill=(0, 200, 255, 80), width=1)
            
    # Highlight major glowing hubs (constellation nodes)
    rng = np.random.RandomState(77)
    hub_indices = rng.choice(len(proj_globe), size=32, replace=False)
    for idx in hub_indices:
        p = proj_globe[idx]
        draw.ellipse([p[0]-3.5, p[1]-3.5, p[0]+3.5, p[1]+3.5], fill=(220, 255, 255, 255))
        draw.ellipse([p[0]-6, p[1]-6, p[0]+6, p[1]+6], outline=(0, 230, 255, 180), width=1)
        
    # Draw constellation connecting arcs between hubs
    for i in range(len(hub_indices) - 1):
        p1 = proj_globe[hub_indices[i]]
        p2 = proj_globe[hub_indices[i+1]]
        if math.hypot(p1[0]-p2[0], p1[1]-p2[1]) < 220:
            draw.line([p1, p2], fill=(0, 240, 255, 150), width=1)
            
    glow = wire.filter(ImageFilter.GaussianBlur(radius=6))
    res = Image.alpha_composite(base.convert('RGBA'), glow)
    res = Image.alpha_composite(res, wire)
    res.convert('RGB').save('public/bg_wireframe_career.jpg', quality=95)

if __name__ == '__main__':
    make_hero()
    make_problem()
    make_understand()
    make_diagnose()
    make_adapt()
    make_career()
    print("All wireframe background illustrations created successfully!")
