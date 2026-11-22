package com.PJ.Project.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

/**
 * Limiteaza numarul de cautari de galerii dupa cod pe IP, ca sa nu se poata ghici
 * codurile prin incercari repetate. Imaginile si thumbnail-urile nu sunt afectate.
 */
@Component
public class GalleryLookupRateLimitFilter extends OncePerRequestFilter {

    /** Doar /api/gallery/{cod}, nu /api/gallery/thumbnail/..., /image/..., /download/... */
    private static final Pattern LOOKUP_PATH = Pattern.compile("^/api/gallery/[^/]+/?$");
    private static final long WINDOW_MS = 60_000;

    private final int limitPerMinute;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public GalleryLookupRateLimitFilter(@Value("${app.gallery.lookup-limit-per-minute:30}") int limitPerMinute) {
        this.limitPerMinute = limitPerMinute;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"GET".equals(request.getMethod()) || !LOOKUP_PATH.matcher(request.getRequestURI()).matches();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long now = System.currentTimeMillis();
        String ip = request.getRemoteAddr();

        Window w = windows.compute(ip, (k, existing) ->
                existing == null || now - existing.start > WINDOW_MS ? new Window(now) : existing);

        if (w.count.incrementAndGet() > limitPerMinute) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":429,\"message\":\"Prea multe incercari. Incearca din nou peste un minut.\"}");
            return;
        }

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().start > WINDOW_MS);
        }
        chain.doFilter(request, response);
    }

    private static final class Window {
        final long start;
        final AtomicInteger count = new AtomicInteger();

        Window(long start) {
            this.start = start;
        }
    }
}
