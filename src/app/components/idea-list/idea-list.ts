import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Idea } from '../../models/idea.model';
import { IdeaService } from '../../services/idea.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

@Component({
  standalone: false,
  selector: 'app-idea-list',
  templateUrl: './idea-list.html',
  styleUrls: ['./idea-list.scss']
})
export class IdeaList implements OnInit {
  ideas: Idea[] = [];
  loading = false;
  loadingMap: { [id: number]: boolean } = {};

  // Modal state
  ideaToDelete: Idea | null = null;
  expandedIdea: Idea | null = null;
  editing = false;

  // Edit form state
  editedTitle: string = '';
  editedContent: string = '';
  savingEdit: boolean = false;

  // Chat state
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  expanding = false;
  isSummarizing = false;

  @ViewChild('chatContainer') chatContainerRef?: ElementRef<HTMLDivElement>;

  constructor(private ideaService: IdeaService) {}

  // ✅ Called when component loads
  ngOnInit() {
    this.refreshIdeas();
  }

  // ✅ Reusable method to reload all ideas
  refreshIdeas() {
    this.loading = true;
    this.ideaService.getIdeas().subscribe(data => {
      console.log('🔄 Refreshed ideas:', data);
      this.ideas = data;
      this.loading = false;
    });
  }

  getPreview(content: string | undefined): string {
    if (!content) return '(No content)';
    const lines = content.split('\n');
    const preview = lines.slice(0, 2).join(' ');
    return preview.length > 150 ? preview.slice(0, 145) + '...' : preview;
  }

  confirmDelete(idea: Idea) {
    this.ideaToDelete = idea;
  }

  deleteIdea(idea: Idea) {
    this.ideaService.deleteIdea(idea.id).subscribe(() => {
      this.ideas = this.ideas.filter(i => i.id !== idea.id);
      if (this.expandedIdea?.id === idea.id) {
        this.closeIdea();
      }
      this.ideaToDelete = null;
    });
  }

  openIdea(idea: Idea) {
    this.expandedIdea = { ...idea };
    this.editing = false;
    this.chatMessages = [];
    this.chatInput = '';

    this.editedTitle = idea.title;
    this.editedContent = idea.content;
  }

  closeIdea() {
    const ideaId = this.expandedIdea?.id;
    if (!ideaId || this.chatMessages.length === 0) {
      this.expandedIdea = null;
      this.chatMessages = [];
      this.editing = false;
      this.chatInput = '';
      return;
    }

    this.isSummarizing = true;
    this.ideaService.summarizeExpansion(ideaId, this.chatMessages).subscribe({
      next: (summary) => {
        this.ideaService.getIdeas().subscribe(updatedList => {
          this.ideas = updatedList;
          this.expandedIdea = null;
          this.chatMessages = [];
          this.editing = false;
          this.chatInput = '';
          this.isSummarizing = false;
        });
      },
      error: () => {
        console.warn("Failed to save AI summary.");
        this.expandedIdea = null;
        this.chatMessages = [];
        this.editing = false;
        this.chatInput = '';
        this.isSummarizing = false;
      }
    });
  }

  startExpansion() {
    if (!this.expandedIdea || this.expanding) return;

    this.expanding = true;

    this.ideaService.expandWithAI(this.expandedIdea.id).subscribe({
      next: (res) => {
        this.chatMessages.push({
          sender: 'ai',
          content: res.expanded
        });
        this.expanding = false;
        this.scrollToBottom();
      },
      error: () => {
        alert('AI expansion failed');
        this.expanding = false;
      }
    });
  }

  sendUserMessage() {
    if (!this.chatInput.trim() || !this.expandedIdea || this.expanding) return;

    const userMessage = this.chatInput.trim();
    this.chatMessages.push({ sender: 'user', content: userMessage });
    this.chatInput = '';
    this.expanding = true;

    this.ideaService.sendMessageToAI(this.expandedIdea.id, userMessage).subscribe({
      next: (res) => {
        this.chatMessages.push({ sender: 'ai', content: res.expanded });
        this.expanding = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Gemini AI failed', err);
        this.expanding = false;
      }
    });
  }

  expandIdea(idea: Idea) {
    this.loadingMap[idea.id] = true;
    this.ideaService.expandWithAI(idea.id).subscribe({
      next: (response) => {
        idea.expandedContent = response.expanded;
        this.loadingMap[idea.id] = false;
      },
      error: () => {
        alert('AI expansion failed');
        this.loadingMap[idea.id] = false;
      }
    });
  }

  saveEdits() {
    if (!this.expandedIdea) return;

    this.savingEdit = true;

    this.ideaService.updateIdea(
      this.expandedIdea.id,
      this.editedTitle,
      this.editedContent
    ).subscribe({
      next: (updated) => {
        const index = this.ideas.findIndex(i => i.id === updated.id);
        if (index > -1) {
          this.ideas[index] = updated;
        }

        this.expandedIdea = { ...updated };
        this.editing = false;
        this.savingEdit = false;
      },
      error: () => {
        alert('Failed to save edits.');
        this.savingEdit = false;
      }
    });
  }

  cancelEdit() {
    this.editing = false;
    if (this.expandedIdea) {
      this.editedTitle = this.expandedIdea.title;
      this.editedContent = this.expandedIdea.content;
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.chatContainerRef?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
