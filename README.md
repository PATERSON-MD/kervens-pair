# 🚀 PATERSON-MD Session Generator

## 📊 Visitor Counter

<p align="center">
  <img src="https://profile-counter.glitch.me/KervensAubourg/count.svg" alt="PATERSON-MD Visitor Counter"/>
</p>

---

## 💡 Fork & Deploy PATERSON-MD

[![Fork Repo](https://img.shields.io/badge/FORK-REPO-8A2BE2?style=for-the-badge&logo=github)](https://github.com/KervensAubourg/PATERSON-MD/fork)

Generate secure WhatsApp sessions using [`@whiskeysockets/baileys`](https://github.com/whiskeysockets/baileys) with:

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

public class PatersonMD extends JFrame {
    
    public PatersonMD() {
        super("PATERSON-MD - WhatsApp Bot");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);
        
        // Create main panel with gradient background
        JPanel mainPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                GradientPaint gp = new GradientPaint(0, 0, new Color(25, 25, 35), 
                        getWidth(), getHeight(), new Color(10, 30, 45));
                g2d.setPaint(gp);
                g2d.fillRect(0, 0, getWidth(), getHeight());
                
                // Draw hacker pattern
                g2d.setColor(new Color(0, 200, 100, 30));
                for (int i = 0; i < 100; i++) {
                    int x = (int) (Math.random() * getWidth());
                    int y = (int) (Math.random() * getHeight());
                    g2d.drawString("1", x, y);
                    g2d.drawString("0", x+10, y+10);
                }
            }
        };
        mainPanel.setLayout(new BorderLayout(20, 20));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        // Header panel
        JPanel headerPanel = new JPanel();
        headerPanel.setOpaque(false);
        headerPanel.setLayout(new BorderLayout());
        
        JLabel titleLabel = new JLabel("PATERSON-MD");
        titleLabel.setFont(new Font("Consolas", Font.BOLD, 36));
        titleLabel.setForeground(new Color(0, 200, 100));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel subtitleLabel = new JLabel("Ultimate WhatsApp Bot Solution");
        subtitleLabel.setFont(new Font("Arial", Font.PLAIN, 18));
        subtitleLabel.setForeground(new Color(180, 180, 220));
        subtitleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        headerPanel.add(titleLabel, BorderLayout.CENTER);
        headerPanel.add(subtitleLabel, BorderLayout.SOUTH);
        
        // Image panel
        JLabel imageLabel = new JLabel();
        imageLabel.setIcon(new ImageIcon(createMatrixImage()));
        imageLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        // Buttons panel
        JPanel buttonPanel = new JPanel(new GridLayout(3, 1, 10, 10));
        buttonPanel.setOpaque(false);
        
        JButton sessionButton = createHackerButton("🔑 GET SESSION ID", new Color(0, 150, 200));
        JButton herokuButton = createHackerButton("🚀 DEPLOY ON HEROKU", new Color(100, 50, 200));
        JButton renderButton = createHackerButton("☁️ DEPLOY ON RENDER", new Color(200, 100, 50));
        
        sessionButton.addActionListener(e -> openURL("https://example.com/session"));
        herokuButton.addActionListener(e -> openURL("https://heroku.com/deploy"));
        renderButton.addActionListener(e -> openURL("https://render.com/deploy"));
        
        buttonPanel.add(sessionButton);
        buttonPanel.add(herokuButton);
        buttonPanel.add(renderButton);
        
        // Footer panel
        JPanel footerPanel = new JPanel();
        footerPanel.setOpaque(false);
        JLabel footerLabel = new JLabel("Created by KERVENS AUBOURG 🇭🇹 | PATERSON-MD v3.0");
        footerLabel.setForeground(new Color(150, 180, 200));
        footerPanel.add(footerLabel);
        
        // Add components to main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(imageLabel, BorderLayout.CENTER);
        mainPanel.add(buttonPanel, BorderLayout.SOUTH);
        mainPanel.add(footerPanel, BorderLayout.SOUTH);
        
        add(mainPanel);
        setVisible(true);
    }
    
    private Image createMatrixImage() {
        int width = 400;
        int height = 300;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        // Draw background
        g2d.setColor(new Color(10, 20, 30));
        g2d.fillRect(0, 0, width, height);
        
        // Draw matrix code rain
        g2d.setFont(new Font("Monospaced", Font.BOLD, 14));
        for (int i = 0; i < 500; i++) {
            int x = (int) (Math.random() * width);
            int y = (int) (Math.random() * height);
            int charValue = (int) (Math.random() * 2);
            g2d.setColor(new Color(0, 200 + (int)(Math.random() * 55), 0, 180));
            g2d.drawString(charValue == 0 ? "0" : "1", x, y);
        }
        
        // Draw PATERSON-MD text
        g2d.setColor(new Color(0, 200, 100, 200));
        g2d.setFont(new Font("Consolas", Font.BOLD, 24));
        g2d.drawString("PATERSON-MD", width/2-100, height/2);
        
        g2d.dispose();
        return image;
    }
    
    private JButton createHackerButton(String text, Color color) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                
                // Draw gradient background
                GradientPaint gp = new GradientPaint(0, 0, color.darker(), 
                        0, getHeight(), color.brighter());
                g2d.setPaint(gp);
                g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 20, 20);
                
                // Draw text
                g2d.setColor(Color.WHITE);
                g2d.setFont(new Font("Arial", Font.BOLD, 16));
                FontMetrics fm = g2d.getFontMetrics();
                int x = (getWidth() - fm.stringWidth(getText())) / 2;
                int y = ((getHeight() - fm.getHeight()) / 2) + fm.getAscent();
                g2d.drawString(getText(), x, y);
                
                // Draw glow effect
                g2d.setColor(new Color(255, 255, 255, 50));
                g2d.drawRoundRect(0, 0, getWidth()-1, getHeight()-1, 20, 20);
            }
        };
        
        button.setContentAreaFilled(false);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(300, 60));
        button.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        
        return button;
    }
    
    private void openURL(String url) {
        try {
            Desktop.getDesktop().browse(new URI(url));
        } catch (IOException | URISyntaxException ex) {
            JOptionPane.showMessageDialog(this, "Error opening URL: " + ex.getMessage(), 
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PatersonMD());
    }
}
RgYhD0N.png" width=20> **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https://github.com/KervensAubourg/PATERSON-MD) | Free tier friendly |
| <img src="https://i.imgur.com/akabD2k.png" width=20> **Koyeb** | [![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=https://github.com/KervensAubourg/PATERSON-MD) | Fast global deployment |
| <img src="https://i.imgur.com/8H7QR4e.png" width=20> **Heroku** | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?template=https://github.com/KervensAubourg/PATERSON-MD) | Requires credit card |

```bash
# Local installation
git clone https://github.com/KervensAubourg/PATERSON-MD
cd PATERSON-MD
npm install
npm start
