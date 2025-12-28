import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/chasselifeph',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/chasse.life/',
    },
    // {
    //   name: 'YouTube',
    //   url: 'https://m.youtube.com/@chasselife',
    // },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@chasse.life',
    },
  ];

  getSocialLinkClasses(name: string): string {
    const baseClasses =
      'flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 transition-colors duration-200';

    switch (name) {
      case 'Facebook':
        return `${baseClasses} hover:bg-blue-100 hover:text-blue-600`;
      case 'Instagram':
        return `${baseClasses} hover:bg-pink-100 hover:text-pink-600`;
      case 'YouTube':
        return `${baseClasses} hover:bg-red-100 hover:text-red-600`;
      case 'TikTok':
        return `${baseClasses} hover:bg-black hover:text-white`;
      default:
        return `${baseClasses} hover:bg-primary-100 hover:text-primary`;
    }
  }
}
