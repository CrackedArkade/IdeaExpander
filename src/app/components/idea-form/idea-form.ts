import { Component, Output, EventEmitter } from '@angular/core';
import { IdeaService } from '../../services/idea.service';
import { Idea } from '../../models/idea.model';

@Component({
  standalone: false,
  selector: 'app-idea-form',
  templateUrl: './idea-form.html',
  styleUrls: ['./idea-form.scss']
})
export class IdeaForm {
  title = '';
  content = '';
  saving = false;

  // ✅ Emits event to parent when an idea is saved
  @Output() ideaSaved = new EventEmitter<void>();

  constructor(private ideaService: IdeaService) {}

  submitIdea() {
    const trimmedTitle = this.title.trim();
    const trimmedContent = this.content.trim();

    if (!trimmedTitle || !trimmedContent) return;

    console.log("📤 Submitting idea:", {
      title: trimmedTitle,
      content: trimmedContent
    });

    this.saving = true;
    this.ideaService.addIdea(trimmedTitle, trimmedContent).subscribe(
      () => {
        this.title = '';
        this.content = '';
        this.saving = false;

        this.ideaSaved.emit(); // ✅ Notify parent
      },
      err => {
        console.error('❌ Error saving idea!', err);
        alert('Error saving idea!');
        this.saving = false;
      }
    );
  }
}
