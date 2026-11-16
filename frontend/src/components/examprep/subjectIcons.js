import {
  Layers,
  Sigma,
  Cpu,
  Server,
  Code,
  GitBranch,
  Network,
  FileCode,
  HardDrive,
  Database,
  Wifi,
  BookOpen
} from 'lucide-react';

/**
 * Maps GATE CS/IT Subject ID to its corresponding Lucide icon component.
 */
export function getSubjectIcon(id) {
  switch (id) {
    case 'all':
      return Layers;
    case 'math':
      return Sigma;
    case 'dl':
      return Cpu;
    case 'coa':
      return Server;
    case 'ds':
      return Code;
    case 'algo':
      return GitBranch;
    case 'toc':
      return Network;
    case 'cd':
      return FileCode;
    case 'os':
      return HardDrive;
    case 'dbms':
      return Database;
    case 'cn':
      return Wifi;
    default:
      return BookOpen;
  }
}
