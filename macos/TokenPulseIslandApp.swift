import Cocoa
import WebKit

final class TokenPulseAppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    private let serviceURL = URL(string: "http://127.0.0.1:4188")!
    private let summaryURL = URL(string: "http://127.0.0.1:4188/api/summary")!
    private let launchAgentLabel = "com.huxy.tokenpulse-island"
    private var statusItem: NSStatusItem!
    private let popover = NSPopover()
    private let contextMenu = NSMenu()
    private var webView: WKWebView?
    private var refreshTimer: Timer?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        ensureLocalService()
        setupStatusItem()
        setupPopover()
        updateStatusTitle()
        refreshTimer = Timer.scheduledTimer(
            timeInterval: 60,
            target: self,
            selector: #selector(updateStatusTitle),
            userInfo: nil,
            repeats: true
        )
    }

    func applicationWillTerminate(_ notification: Notification) {
        refreshTimer?.invalidate()
    }

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        guard let button = statusItem.button else { return }

        button.image = NSImage(
            systemSymbolName: "chart.line.uptrend.xyaxis",
            accessibilityDescription: "OpenToken 反馈小岛"
        )
        button.imagePosition = .imageLeft
        button.title = " --"
        button.target = self
        button.action = #selector(togglePopover)

        let rightClick = NSClickGestureRecognizer(target: self, action: #selector(showContextMenu(_:)))
        rightClick.buttonMask = 0x2
        button.addGestureRecognizer(rightClick)

        let openItem = NSMenuItem(title: "打开本地面板", action: #selector(openDashboard), keyEquivalent: "o")
        openItem.target = self
        contextMenu.addItem(openItem)

        let refreshItem = NSMenuItem(title: "刷新", action: #selector(refreshNow), keyEquivalent: "r")
        refreshItem.target = self
        contextMenu.addItem(refreshItem)

        let restartItem = NSMenuItem(title: "重启本地服务", action: #selector(restartService), keyEquivalent: "s")
        restartItem.target = self
        contextMenu.addItem(restartItem)

        contextMenu.addItem(.separator())

        let quitItem = NSMenuItem(title: "退出 OpenToken 反馈小岛", action: #selector(quit), keyEquivalent: "q")
        quitItem.target = self
        contextMenu.addItem(quitItem)
    }

    private func setupPopover() {
        let viewController = NSViewController()
        let configuration = WKWebViewConfiguration()
        let view = WKWebView(frame: NSRect(x: 0, y: 0, width: 430, height: 760), configuration: configuration)
        view.navigationDelegate = self
        view.autoresizingMask = [.width, .height]
        view.load(URLRequest(url: serviceURL))

        viewController.view = view
        popover.contentViewController = viewController
        popover.contentSize = NSSize(width: 430, height: 760)
        popover.behavior = .transient
        webView = view
    }

    @objc private func togglePopover() {
        guard let button = statusItem.button else { return }
        if popover.isShown {
            popover.performClose(nil)
            return
        }

        webView?.load(URLRequest(url: serviceURL))
        popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
        updateStatusTitle()
    }

    @objc private func showContextMenu(_ recognizer: NSClickGestureRecognizer) {
        guard let button = statusItem.button else { return }
        statusItem.menu = contextMenu
        button.performClick(nil)
        statusItem.menu = nil
    }

    @objc private func openDashboard() {
        NSWorkspace.shared.open(serviceURL)
    }

    @objc private func refreshNow() {
        webView?.reload()
        updateStatusTitle()
    }

    @objc private func restartService() {
        ensureLocalService(forceRestart: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.webView?.reload()
            self?.updateStatusTitle()
        }
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }

    @objc private func updateStatusTitle() {
        URLSession.shared.dataTask(with: summaryURL) { [weak self] data, _, _ in
            guard let self else { return }
            guard
                let data,
                let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                let ok = json["ok"] as? Bool,
                ok
            else {
                DispatchQueue.main.async {
                    self.statusItem.button?.title = " 离线"
                }
                return
            }

            let total = json["totalLabel"] as? String ?? "--"
            let rank = json["rankLabel"] as? String ?? "#--"
            let rankSuffix = rank == "#--" ? "" : " \(rank)"

            DispatchQueue.main.async {
                self.statusItem.button?.title = " \(total)\(rankSuffix)"
            }
        }.resume()
    }

    private func ensureLocalService(forceRestart: Bool = false) {
        let uid = getuid()
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        process.arguments = forceRestart
            ? ["kickstart", "-k", "gui/\(uid)/\(launchAgentLabel)"]
            : ["kickstart", "gui/\(uid)/\(launchAgentLabel)"]
        process.standardOutput = Pipe()
        process.standardError = Pipe()
        try? process.run()
    }
}

let app = NSApplication.shared
let delegate = TokenPulseAppDelegate()
app.delegate = delegate
app.run()
