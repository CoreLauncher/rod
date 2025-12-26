use serde_json::{Value, json};
use std::ffi::CStr;
use std::ffi::CString;
use std::ffi::c_char;
use std::ffi::c_void;
use tao::dpi::LogicalPosition;
use tao::dpi::LogicalSize;
use tao::dpi::PhysicalPosition;
use tao::dpi::PhysicalSize;
use tao::event::Event;
use tao::event::WindowEvent;
use tao::event_loop::{ControlFlow, EventLoop, EventLoopBuilder};
use tao::window::Fullscreen::Borderless;
use tao::window::ProgressBarState;
use tao::window::ProgressState;
use tao::window::WindowBuilder;
use tao::{platform::run_return::EventLoopExtRunReturn, window::Window};
use wry::WebViewBuilder;

//#region Pointer conversions
fn string_from_ptr(string_ptr: *mut c_void) -> String {
    unsafe { CStr::from_ptr(string_ptr as *const c_char) }
        .to_str()
        .unwrap_or_default()
        .to_string()
}

fn string_to_ptr(string: &str) -> CString {
    return CString::new(string).unwrap();
}

fn event_loop_from_ptr(event_loop_ptr: *mut c_void) -> &'static mut EventLoop<()> {
    unsafe { &mut *(event_loop_ptr as *mut EventLoop<()>) }
}

fn event_loop_to_ptr(event_loop: EventLoop<()>) -> *mut c_void {
    Box::into_raw(Box::new(event_loop)) as *mut c_void
}

fn window_from_ptr(window_ptr: *mut c_void) -> &'static mut Window {
    unsafe { &mut *(window_ptr as *mut Window) }
}

fn window_to_ptr(window: Window) -> *mut c_void {
    Box::into_raw(Box::new(window)) as *mut c_void
}

fn webview_from_ptr(webview_ptr: *mut c_void) -> &'static mut wry::WebView {
    unsafe { &mut *(webview_ptr as *mut wry::WebView) }
}

fn webview_to_ptr(webview: wry::WebView) -> *mut c_void {
    Box::into_raw(Box::new(webview)) as *mut c_void
}
//#endregion

#[unsafe(no_mangle)]
pub extern "C" fn rod_event_loop_create() -> *mut c_void {
    let event_loop: EventLoop<()> = EventLoopBuilder::new().build();
    return event_loop_to_ptr(event_loop);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_event_loop_destroy(event_loop_ptr: *mut c_void) {
    if event_loop_ptr.is_null() {
        return;
    }
    // Reconstruct the Box to drop the EventLoop
    unsafe {
        drop(Box::from_raw(event_loop_ptr as *mut EventLoop<()>));
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_event_loop_poll(
    event_loop_ptr: *mut c_void,
    callback: extern "C" fn(event: *const c_char, data: *const c_char),
) {
    let event_loop = event_loop_from_ptr(event_loop_ptr);

    fn call_callback(
        callback: extern "C" fn(event: *const c_char, data: *const c_char),
        event_name: &str,
        data_json: &serde_json::Value,
    ) {
        let event_c = string_to_ptr(event_name);
        let data_c = string_to_ptr(data_json.to_string().as_str());

        callback(event_c.as_ptr(), data_c.as_ptr());
    }

    event_loop.run_return(|event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match &event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                call_callback(callback, "window_close_requested", &json!({}));
            }
            Event::WindowEvent {
                event: WindowEvent::Focused(state),
                ..
            } => {
                call_callback(callback, "window_focused", &json!(state));
            }
            Event::WindowEvent {
                event: WindowEvent::Moved(position),
                ..
            } => {
                call_callback(
                    callback,
                    "window_moved",
                    &json!({
                        "x": position.x,
                        "y": position.y
                    }),
                );
            }
            Event::WindowEvent {
                event: WindowEvent::Resized(size),
                ..
            } => {
                call_callback(
                    callback,
                    "window_resized",
                    &json!({
                        "width": size.width,
                        "height": size.height
                    }),
                );
            }
            Event::MainEventsCleared => {
                *control_flow = ControlFlow::Exit;
            }
            _ => (),
        }
    });
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_create(
    event_loop_ptr: *mut c_void,
    options_str_ptr: *mut c_void,
) -> *mut c_void {
    let event_loop = event_loop_from_ptr(event_loop_ptr);
    let options_str = string_from_ptr(options_str_ptr);
    let options: Value = serde_json::from_str(&options_str).unwrap();

    let mut builder = WindowBuilder::new();

    if options["always_on_bottom"].is_boolean() {
        builder = builder.with_always_on_bottom(options["always_on_bottom"].as_bool().unwrap());
    }

    if options["always_on_top"].is_boolean() {
        builder = builder.with_always_on_top(options["always_on_top"].as_bool().unwrap());
    }

    if options["closable"].is_boolean() {
        builder = builder.with_closable(options["closable"].as_bool().unwrap());
    }

    if options["content_protection"].is_boolean() {
        builder = builder.with_content_protection(options["content_protection"].as_bool().unwrap());
    }

    if options["decorations"] == false {
        builder = builder.with_decorations(false);
    }

    if options["focusable"].is_boolean() {
        builder = builder.with_focusable(options["focusable"].as_bool().unwrap());
    }

    if options["focused"].is_boolean() {
        builder = builder.with_focused(options["focused"].as_bool().unwrap());
    }

    if options["size"].is_object() {
        let width = options["size"]["width"].as_u64().unwrap() as f64;
        let height = options["size"]["height"].as_u64().unwrap() as f64;
        builder = builder.with_inner_size(LogicalSize::new(width, height));
    }

    if options["minimum_size"].is_object() {
        let width = options["minimum_size"]["width"].as_u64().unwrap() as f64;
        let height = options["minimum_size"]["height"].as_u64().unwrap() as f64;
        builder = builder.with_min_inner_size(LogicalSize::new(width, height));
    }

    if options["maximum_size"].is_object() {
        let width = options["maximum_size"]["width"].as_u64().unwrap() as f64;
        let height = options["maximum_size"]["height"].as_u64().unwrap() as f64;
        builder = builder.with_max_inner_size(LogicalSize::new(width, height));
    }

    if options["maximizable"].is_boolean() {
        builder = builder.with_maximizable(options["maximizable"].as_bool().unwrap());
    }

    if options["maximized"].is_boolean() {
        builder = builder.with_maximized(options["maximized"].as_bool().unwrap());
    }

    if options["minimizable"].is_boolean() {
        builder = builder.with_minimizable(options["minimizable"].as_bool().unwrap());
    }

    if options["position"].is_object() {
        let x = options["position"]["x"].as_i64().unwrap() as f64;
        let y = options["position"]["y"].as_i64().unwrap() as f64;
        builder = builder.with_position(LogicalPosition::new(x, y));
    }

    if options["resizable"].is_boolean() {
        builder = builder.with_resizable(options["resizable"].as_bool().unwrap());
    }

    if options["title"].is_string() {
        let title = options["title"].as_str().unwrap();
        builder = builder.with_title(title);
    }

    if options["transparent"].is_boolean() {
        builder = builder.with_transparent(options["transparent"].as_bool().unwrap());

        #[cfg(target_os = "windows")]
        {
            use tao::platform::windows::WindowBuilderExtWindows;
            builder = builder.with_undecorated_shadow(false);
        }
    }

    if options["visible"].is_boolean() {
        builder = builder.with_visible(options["visible"].as_bool().unwrap());
    }

    if options["visible_on_all_workspaces"].is_boolean() {
        builder = builder.with_visible_on_all_workspaces(
            options["visible_on_all_workspaces"].as_bool().unwrap(),
        );
    }

    let window = builder.build(event_loop).unwrap();
    return window_to_ptr(window);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_destroy(window_ptr: *mut c_void) {
    if window_ptr.is_null() {
        return;
    }
    unsafe {
        drop(Box::from_raw(window_ptr as *mut Window));
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_title(window_ptr: *mut c_void) -> *const c_char {
    let window = window_from_ptr(window_ptr);
    return string_to_ptr(window.title().as_str()).into_raw();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_size(window_ptr: *mut c_void) -> *const c_char {
    let window = window_from_ptr(window_ptr);
    let size = window.inner_size();
    return string_to_ptr(&json!({"width": size.width, "height": size.height}).to_string())
        .into_raw();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_position(window_ptr: *mut c_void) -> *const c_char {
    let window = window_from_ptr(window_ptr);
    let position = window.outer_position().unwrap();
    return string_to_ptr(&json!({"x": position.y, "y": position.y}).to_string()).into_raw();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_always_on_top(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_always_on_top();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_closable(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_closable();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_decorated(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_decorated();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_focused(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_focused();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_maximizable(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_maximizable();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_maximized(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_maximized();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_minimizable(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_minimizable();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_minimized(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_minimized();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_resizable(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_resizable();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_get_visible(window_ptr: *mut c_void) -> bool {
    let window = window_from_ptr(window_ptr);
    return window.is_visible();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_always_on_bottom(
    window_ptr: *mut c_void,
    always_on_bottom: bool,
) {
    let window = window_from_ptr(window_ptr);
    window.set_always_on_bottom(always_on_bottom);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_always_on_top(
    window_ptr: *mut c_void,
    always_on_top: bool,
) {
    let window = window_from_ptr(window_ptr);
    window.set_always_on_top(always_on_top);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_closable(window_ptr: *mut c_void, closable: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_closable(closable);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_content_protection(
    window_ptr: *mut c_void,
    content_protection: bool,
) {
    let window = window_from_ptr(window_ptr);
    window.set_content_protection(content_protection);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_decorations(window_ptr: *mut c_void, decorations: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_decorations(decorations);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_focus(window_ptr: *mut c_void) {
    let window = window_from_ptr(window_ptr);
    window.set_focus();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_focusable(window_ptr: *mut c_void, focusable: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_focusable(focusable);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_fullscreen(window_ptr: *mut c_void, fullscreen: bool) {
    let window = window_from_ptr(window_ptr);
    if fullscreen {
        window.set_fullscreen(Some(Borderless(None)));
        return;
    } else {
        window.set_fullscreen(None);
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_ignore_cursor_events(
    window_ptr: *mut c_void,
    ignore_cursor_events: bool,
) {
    let window = window_from_ptr(window_ptr);
    window
        .set_ignore_cursor_events(ignore_cursor_events)
        .unwrap();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_size(window_ptr: *mut c_void, size_str_ptr: *mut c_void) {
    let window = window_from_ptr(window_ptr);
    let size_str = string_from_ptr(size_str_ptr);
    let size: Value = serde_json::from_str(&size_str).unwrap();
    let width = size["width"].as_f64().unwrap();
    let height = size["height"].as_f64().unwrap();
    window.set_inner_size(PhysicalSize::new(width, height));
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_maximum_size(
    window_ptr: *mut c_void,
    maximum_size_str_ptr: *mut c_void,
) {
    let window = window_from_ptr(window_ptr);
    let maximum_size_str = string_from_ptr(maximum_size_str_ptr);

    if maximum_size_str.trim().is_empty() {
        window.set_max_inner_size(None::<PhysicalSize<f64>>);
        return;
    }

    let maximum_size: Value = serde_json::from_str(&maximum_size_str).unwrap();
    let width = maximum_size["width"].as_f64().unwrap();
    let height = maximum_size["height"].as_f64().unwrap();
    window.set_max_inner_size(Some(PhysicalSize::new(width, height)));
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_maximizable(window_ptr: *mut c_void, maximizable: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_maximizable(maximizable);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_maximized(window_ptr: *mut c_void, maximized: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_maximized(maximized);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_minimum_size(
    window_ptr: *mut c_void,
    minimum_size_str_ptr: *mut c_void,
) {
    let window = window_from_ptr(window_ptr);
    let minimum_size_str = string_from_ptr(minimum_size_str_ptr);

    if minimum_size_str.trim().is_empty() {
        window.set_min_inner_size(None::<PhysicalSize<f64>>);
        return;
    }

    let minimum_size: Value = serde_json::from_str(&minimum_size_str).unwrap();
    let width = minimum_size["width"].as_f64().unwrap();
    let height = minimum_size["height"].as_f64().unwrap();
    window.set_min_inner_size(Some(PhysicalSize::new(width, height)));
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_minimizable(window_ptr: *mut c_void, minimizable: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_minimizable(minimizable);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_minimized(window_ptr: *mut c_void, minimized: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_minimized(minimized);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_position(
    window_ptr: *mut c_void,
    position_str_ptr: *mut c_void,
) {
    let window = window_from_ptr(window_ptr);
    let position_size_str = string_from_ptr(position_str_ptr);
    let position: Value = serde_json::from_str(&position_size_str).unwrap();
    let x = position["x"].as_f64().unwrap();
    let y = position["y"].as_f64().unwrap();
    window.set_outer_position(PhysicalPosition::new(x, y));
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_progress_bar(
    window_ptr: *mut c_void,
    progress_bar_str_ptr: *mut c_void,
) {
    let window = window_from_ptr(window_ptr);
    let progress_bar_str = string_from_ptr(progress_bar_str_ptr);
    let progress_bar: Value = serde_json::from_str(&progress_bar_str).unwrap();
    let state = progress_bar["state"].as_f64().unwrap();
    let progress = progress_bar["progress"].as_u64().unwrap();

    let parsed_state = match state as i32 {
        0 => ProgressState::Normal,
        1 => ProgressState::Indeterminate,
        2 => ProgressState::Paused,
        3 => ProgressState::Error,
        _ => ProgressState::None,
    };

    window.set_progress_bar(ProgressBarState {
        state: Some(parsed_state),
        progress: Some(progress),
        desktop_filename: None,
    });
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_resizable(window_ptr: *mut c_void, resizable: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_resizable(resizable);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_title(window_ptr: *mut c_void, title_str_ptr: *mut c_void) {
    let window = window_from_ptr(window_ptr);
    let title_str = string_from_ptr(title_str_ptr);
    window.set_title(&title_str);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_visible(window_ptr: *mut c_void, visible: bool) {
    let window = window_from_ptr(window_ptr);
    window.set_visible(visible);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_window_set_visible_on_all_workspaces(
    window_ptr: *mut c_void,
    visible_on_all_workspaces: bool,
) {
    let window = window_from_ptr(window_ptr);
    window.set_visible_on_all_workspaces(visible_on_all_workspaces);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_create(
    window_ptr: *mut c_void,
    options_str_ptr: *mut c_void,
) -> *mut c_void {
    let window = window_from_ptr(window_ptr);
    let options_str = string_from_ptr(options_str_ptr);
    let options: Value = serde_json::from_str(&options_str).unwrap();

    let mut builder = WebViewBuilder::new();

    if options["autoplay"].is_boolean() {
        builder = builder.with_autoplay(options["autoplay"].as_bool().unwrap());
    }

    if options["back_forward_navigation_gestures"].is_boolean() {
        builder = builder.with_back_forward_navigation_gestures(
            options["back_forward_navigation_gestures"]
                .as_bool()
                .unwrap(),
        );
    }

    if options["dev_tools"].is_boolean() {
        builder = builder.with_devtools(options["dev_tools"].as_bool().unwrap());
    }

    if options["hotkeys_zoom"].is_boolean() {
        builder = builder.with_hotkeys_zoom(options["hotkeys_zoom"].as_bool().unwrap());
    }

    if options["html"].is_string() {
        let html = options["html"].as_str().unwrap();
        builder = builder.with_html(html);
    }

    if options["url"].is_string() {
        let url = options["url"].as_str().unwrap();
        builder = builder.with_url(url);
    }

    if options["transparent"].is_boolean() {
        builder = builder.with_transparent(options["transparent"].as_bool().unwrap());
    }

    let webview = builder.build(window).unwrap();
    return webview_to_ptr(webview);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_destroy(webview_ptr: *mut c_void) {
    if webview_ptr.is_null() {
        return;
    }
    unsafe {
        drop(Box::from_raw(webview_ptr as *mut wry::WebView));
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_get_url(webview_ptr: *mut c_void) -> *const c_char {
    let webview = webview_from_ptr(webview_ptr);
    match webview.url() {
        Ok(url) => string_to_ptr(&url).into_raw(),
        Err(_) => string_to_ptr("").into_raw(),
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_is_devtools_open(webview_ptr: *mut c_void) -> bool {
    let webview = webview_from_ptr(webview_ptr);
    webview.is_devtools_open()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_set_url(webview_ptr: *mut c_void, url_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    let url = string_from_ptr(url_ptr);
    webview.load_url(&url).unwrap();
    return;
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_open_devtools(webview_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    webview.open_devtools();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_close_devtools(webview_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    webview.close_devtools();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_zoom(webview_ptr: *mut c_void, scale_factor: f64) {
    let webview = webview_from_ptr(webview_ptr);
    let _ = webview.zoom(scale_factor);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_reload(webview_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    let _ = webview.reload();
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_set_html(webview_ptr: *mut c_void, html_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    let html = string_from_ptr(html_ptr);
    let _ = webview.load_html(&html);
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn rod_webview_clear_all_browsing_data(webview_ptr: *mut c_void) {
    let webview = webview_from_ptr(webview_ptr);
    let _ = webview.clear_all_browsing_data();
}
